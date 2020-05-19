/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import tinymce from 'tinymce/tinymce';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { deserialize } from 'lib/media-serialization';
import MediaStore from 'lib/media/store';
import { url as mediaUrl } from 'lib/media/utils';
import { Dialog } from '@automattic/components';
import FormTextInput from 'components/forms/form-text-input';
import FormCheckbox from 'components/forms/form-checkbox';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import PostSelector from 'my-sites/post-selector';
import { getSelectedSite } from 'state/ui/selectors';
import { getSitePosts } from 'state/posts/selectors';
import { decodeEntities } from 'lib/formatting';
import { recordEditorEvent, recordEditorStat } from 'state/posts/stats';
import Gridicon from 'components/gridicon';

/**
 * Module variables
 */
const REGEXP_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const REGEXP_URL = /^(https?|ftp):\/\/[A-Z0-9.-]+\.[A-Z]{2,4}[^ "]*$/i;
const REGEXP_STANDALONE_URL = /^(?:[a-z]+:|#|\?|\.|\/)/;

class LinkDialog extends React.Component {
	static propTypes = {
		visible: PropTypes.bool,
		editor: PropTypes.object,
		onClose: PropTypes.func,
		site: PropTypes.object,
		sitePosts: PropTypes.array,
		firstLoad: PropTypes.bool,
	};

	static defaultProps = {
		onClose: () => {},
		firstLoad: false,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.visible && ! this.props.visible ) {
			this.setState( this.getState() );
		}
	}

	getLink = () => {
		const { editor } = this.props;

		return editor.dom.getParent( editor.selection.getNode(), 'a' );
	};

	getCorrectedUrl = () => {
		const url = this.state.url.trim();

		if ( REGEXP_EMAIL.test( url ) ) {
			return 'mailto:' + url;
		}

		if ( ! REGEXP_STANDALONE_URL.test( url ) ) {
			return 'http://' + url;
		}

		return url;
	};

	updateEditor = () => {
		const { editor } = this.props;

		editor.focus();

		if ( tinymce.isIE ) {
			editor.selection.moveToBookmark( editor.windowManager.bookmark );
		}

		if ( ! this.state.url ) {
			this.removeLink();
			return;
		}

		const link = this.getLink();
		let { linkText } = this.state;
		const attrs = {
			href: this.getCorrectedUrl(),
			target: this.state.newWindow ? '_blank' : '',
		};

		if ( link ) {
			if ( linkText ) {
				if ( 'innerText' in link ) {
					link.innerText = linkText;
				} else {
					link.textContent = linkText;
				}
			}

			editor.dom.setAttribs( link, attrs );
		} else if ( linkText ) {
			linkText = editor.dom.encode( linkText );
			editor.selection.setNode( editor.dom.create( 'a', attrs, linkText ) );
		} else {
			editor.execCommand( 'mceInsertLink', false, attrs );
		}

		this.closeDialog();
	};

	hasSelectedText = ( linkNode ) => {
		const { editor } = this.props;
		const html = editor.selection.getContent();
		let nodes;

		// Partial html and not a fully selected anchor element
		if (
			/</.test( html ) &&
			( ! /^<a [^>]+>[^<]+<\/a>$/.test( html ) || html.indexOf( 'href=' ) === -1 )
		) {
			return false;
		}

		if ( linkNode ) {
			nodes = linkNode.childNodes;

			if ( nodes.length === 0 ) {
				return false;
			}

			for ( let i = nodes.length - 1; i >= 0; i-- ) {
				if ( nodes[ i ].nodeType !== 3 ) {
					return false;
				}
			}
		}

		return true;
	};

	getInferredUrl = () => {
		const selectedText = this.props.editor.selection.getContent();
		let parsedImage;
		let knownImage;

		if ( REGEXP_EMAIL.test( selectedText ) ) {
			return 'mailto:' + selectedText;
		} else if ( REGEXP_URL.test( selectedText ) ) {
			return selectedText.replace( /&amp;|&#0?38;/gi, '&' );
		}

		const selectedNode = this.props.editor.selection.getNode();
		if ( selectedNode && 'IMG' === selectedNode.nodeName ) {
			parsedImage = deserialize( selectedNode );
			if ( this.props.site && parsedImage.media.ID ) {
				knownImage =
					MediaStore.get( this.props.site.ID, parsedImage.media.ID ) || parsedImage.media;
				return mediaUrl( knownImage, {
					size: 'full',
				} );
			} else if ( parsedImage.media.URL ) {
				return parsedImage.media.URL;
			}
		}
	};

	getState = () => {
		const { editor } = this.props;
		const selectedNode = editor.selection.getNode();
		const linkNode = editor.dom.getParent( selectedNode, 'a[href]' );
		const onlyText = this.hasSelectedText( linkNode );
		const nextState = {
			isNew: true,
			newWindow: false,
			showLinkText: true,
			linkText: '',
			url: '',
			isUserDefinedLinkText: false,
		};

		if ( linkNode ) {
			nextState.linkText = linkNode.innerText || linkNode.textContent;
			nextState.url = editor.dom.getAttrib( linkNode, 'href' );
			nextState.newWindow = '_blank' === editor.dom.getAttrib( linkNode, 'target' );
			nextState.isNew = false;
		} else if ( onlyText ) {
			nextState.linkText = editor.selection.getContent( { format: 'text' } );
		}

		if ( ! linkNode ) {
			nextState.url = this.getInferredUrl() || '';
		}

		if ( ! this.hasSelectedText( linkNode ) ) {
			nextState.showLinkText = false;
		}

		return nextState;
	};

	closeDialog = () => {
		this.props.onClose();
	};

	setUrl = ( event ) => {
		this.setState( { url: event.target.value } );
	};

	setLinkText = ( event ) => {
		this.setState( {
			linkText: event.target.value,
			isUserDefinedLinkText: true,
		} );
	};

	setNewWindow = ( event ) => {
		this.setState( { newWindow: event.target.checked } );
	};

	onInputKeyDown = ( event ) => {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			this.updateEditor();
		}
	};

	removeLink = () => {
		this.props.editor.execCommand( 'unlink' );
		this.closeDialog();
	};

	getButtons = () => {
		let buttonText;

		if ( this.state.isNew ) {
			buttonText = this.props.translate( 'Add Link' );
		} else {
			buttonText = this.props.translate( 'Save' );
		}

		const buttons = [
			<FormButton key="save" onClick={ this.updateEditor }>
				{ buttonText }
			</FormButton>,
			<FormButton key="cancel" isPrimary={ false } onClick={ this.closeDialog }>
				{ this.props.translate( 'Cancel' ) }
			</FormButton>,
		];

		if ( this.state.url && ! this.state.isNew ) {
			buttons.push(
				<button className={ 'wplink__remove-link' } onClick={ this.removeLink }>
					<Gridicon icon="link-break" />
					{ this.props.translate( 'Remove' ) }
				</button>
			);
		}

		return buttons;
	};

	setExistingContent = ( post ) => {
		const state = { url: post.URL };
		const shouldSetLinkText =
			! this.state.isUserDefinedLinkText &&
			! this.props.editor.selection.getContent() &&
			! this.getLink();

		if ( shouldSetLinkText ) {
			Object.assign( state, {
				linkText: decodeEntities( post.title ),
			} );
		}

		this.props.recordEditorStat( 'link-existing-content' );
		this.props.recordEditorEvent( 'Set link to existing content' );

		this.setState( state );
	};

	getSelectedPostId = () => {
		if ( ! this.state.url || ! this.props.sitePosts ) {
			return;
		}

		const selectedPost = find( this.props.sitePosts, { URL: this.state.url } );
		if ( selectedPost ) {
			return selectedPost.ID;
		}
	};

	state = this.getState();

	/* eslint-disable jsx-a11y/no-autofocus */
	render() {
		return (
			<Dialog
				isVisible={ this.props.visible }
				onClose={ this.closeDialog }
				buttons={ this.getButtons() }
				autoFocus={ false }
				additionalClassNames="wplink__dialog"
			>
				<FormFieldset>
					<FormLabel>
						<span>{ this.props.translate( 'URL' ) }</span>
						<FormTextInput
							// eslint-disable-next-line react/no-string-refs
							ref="url"
							autoFocus={ true }
							onChange={ this.setUrl }
							value={ this.state.url }
							onKeyDown={ this.onInputKeyDown }
						/>
					</FormLabel>
					{ this.state.showLinkText ? (
						<FormLabel>
							<span>{ this.props.translate( 'Link Text' ) }</span>
							<FormTextInput
								onChange={ this.setLinkText }
								value={ this.state.linkText }
								onKeyDown={ this.onInputKeyDown }
							/>
						</FormLabel>
					) : null }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox onChange={ this.setNewWindow } checked={ this.state.newWindow } />
						<span>{ this.props.translate( 'Open link in a new window/tab' ) }</span>
					</FormLabel>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<span>{ this.props.translate( 'Link to existing content' ) }</span>
						{ this.props.site && (
							<PostSelector
								siteId={ this.props.site.ID }
								type="any"
								excludePrivateTypes={ true }
								status="publish"
								orderBy="date"
								order="DESC"
								selected={ this.getSelectedPostId() }
								onChange={ this.setExistingContent }
								suppressFirstPageLoad={ ! this.props.firstLoad }
								emptyMessage={ this.props.translate( 'No posts found' ) }
							/>
						) }
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	}
	/* eslint-enable jsx-a11y/no-autofocus */
}

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state );
		return {
			site: selectedSite,
			sitePosts: selectedSite ? getSitePosts( state, selectedSite.ID ) : null,
		};
	},
	{ recordEditorEvent, recordEditorStat }
)( localize( LinkDialog ) );
