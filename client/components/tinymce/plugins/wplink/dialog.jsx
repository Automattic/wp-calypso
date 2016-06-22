/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import tinymce from 'tinymce/tinymce';
import { connect } from 'react-redux';
import find from 'lodash/find';

/**
 * Internal dependencies
 */
import * as MediaSerialization from 'lib/media-serialization';
import MediaStore from 'lib/media/store';
import MediaUtils from 'lib/media/utils';
import Dialog from 'components/dialog';
import FormTextInput from 'components/forms/form-text-input';
import FormCheckbox from 'components/forms/form-checkbox';
import FormButton from 'components/forms/form-button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import Gridicon from 'components/gridicon';
import PostSelector from 'my-sites/post-selector';
import { getSelectedSite } from 'state/ui/selectors';
import { getSitePosts } from 'state/posts/selectors';
import { decodeEntities } from 'lib/formatting';
import { recordEvent, recordStat } from 'lib/posts/stats';

/**
 * Module variables
 */
var REGEXP_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
	REGEXP_URL = /^(https?|ftp):\/\/[A-Z0-9.-]+\.[A-Z]{2,4}[^ "]*$/i,
	REGEXP_STANDALONE_URL = /^(?:[a-z]+:|#|\?|\.|\/)/;

var LinkDialog = React.createClass( {
	propTypes: {
		visible: PropTypes.bool,
		editor: PropTypes.object,
		onClose: PropTypes.func,
		site: PropTypes.object,
		sitePosts: PropTypes.array
	},

	getInitialState: function() {
		return this.getState();
	},

	getDefaultProps() {
		return {
			onClose: () => {}
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.visible && ! this.props.visible ) {
			this.setState( this.getState() );
		}
	},

	getLink: function() {
		var editor = this.props.editor;

		return editor.dom.getParent( editor.selection.getNode(), 'a' );
	},

	getCorrectedUrl() {
		const url = this.state.url.trim();

		if ( ! REGEXP_STANDALONE_URL.test( url ) ) {
			return 'http://' + url;
		}

		return url;
	},

	updateEditor: function() {
		var editor = this.props.editor,
			attrs, link, linkText;

		editor.focus();

		if ( tinymce.isIE ) {
			editor.selection.moveToBookmark( editor.windowManager.bookmark );
		}

		if ( ! this.state.url ) {
			this.removeLink();
			return;
		}

		link = this.getLink();
		linkText = this.state.linkText;
		attrs = {
			href: this.getCorrectedUrl(),
			target: this.state.newWindow ? '_blank' : ''
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
	},

	hasSelectedText: function( linkNode ) {
		var editor = this.props.editor,
			html = editor.selection.getContent(),
			nodes, i;

		// Partial html and not a fully selected anchor element
		if ( /</.test( html ) && ( ! /^<a [^>]+>[^<]+<\/a>$/.test( html ) || html.indexOf( 'href=' ) === -1 ) ) {
			return false;
		}

		if ( linkNode ) {
			nodes = linkNode.childNodes;

			if ( nodes.length === 0 ) {
				return false;
			}

			for ( i = nodes.length - 1; i >= 0; i-- ) {
				if ( nodes[ i ].nodeType !== 3 ) {
					return false;
				}
			}
		}

		return true;
	},

	getInferredUrl: function() {
		var selectedText = this.props.editor.selection.getContent(),
			selectedNode, parsedImage, knownImage;

		if ( REGEXP_EMAIL.test( selectedText ) ) {
			return 'mailto:' + selectedText;
		} else if ( REGEXP_URL.test( selectedText ) ) {
			return selectedText.replace( /&amp;|&#0?38;/gi, '&' );
		}

		selectedNode = this.props.editor.selection.getNode();
		if ( selectedNode && 'IMG' === selectedNode.nodeName ) {
			parsedImage = MediaSerialization.deserialize( selectedNode );
			if ( this.props.site && parsedImage.media.ID ) {
				knownImage = MediaStore.get( this.props.site.ID, parsedImage.media.ID ) || parsedImage.media;
				return MediaUtils.url( knownImage, {
					size: 'full'
				} );
			} else if ( parsedImage.media.URL ) {
				return parsedImage.media.URL;
			}
		}
	},

	getState: function() {
		var editor = this.props.editor,
			selectedNode = editor.selection.getNode(),
			linkNode = editor.dom.getParent( selectedNode, 'a[href]' ),
			onlyText = this.hasSelectedText( linkNode ),
			nextState = {
				isNew: true,
				newWindow: false,
				showLinkText: true,
				linkText: '',
				url: '',
				isUserDefinedLinkText: false
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
	},

	closeDialog: function() {
		this.props.onClose();
	},

	setUrl: function( event ) {
		this.setState( { url: event.target.value } );
	},

	setLinkText: function( event ) {
		this.setState( {
			linkText: event.target.value,
			isUserDefinedLinkText: true
		} );
	},

	setNewWindow: function( event ) {
		this.setState( { newWindow: event.target.checked } );
	},

	onInputKeyDown: function( event ) {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
			this.updateEditor();
		}
	},

	removeLink: function() {
		this.props.editor.execCommand( 'unlink' );
		this.closeDialog();
	},

	getButtons: function() {
		var buttonText, buttons;

		if ( this.state.isNew ) {
			buttonText = this.translate( 'Add Link' );
		} else {
			buttonText = this.translate( 'Save' );
		}

		buttons = [
			<FormButton
				key="save"
				onClick={ this.updateEditor }>
					{ buttonText }
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				onClick={ this.closeDialog }>
					{ this.translate( 'Cancel' ) }
			</FormButton>
		];

		if ( this.state.url && ! this.state.isNew ) {
			buttons.push(
				<button className={ 'wplink__remove-link' } onClick={ this.removeLink }>
					<Gridicon icon="link-break" />
					{ this.translate( 'Remove' ) }
				</button>
			);
		}

		return buttons;
	},

	setExistingContent( post ) {
		let state = { url: post.URL };
		const shouldSetLinkText = (
			! this.state.isUserDefinedLinkText &&
			! this.props.editor.selection.getContent() &&
			! this.getLink()
		);

		if ( shouldSetLinkText ) {
			Object.assign( state, {
				linkText: decodeEntities( post.title )
			} );
		}

		recordStat( 'link-existing-content' );
		recordEvent( 'Set link to existing content' );

		this.setState( state );
	},

	getSelectedPostId() {
		if ( ! this.state.url || ! this.props.sitePosts ) {
			return;
		}

		const selectedPost = find( this.props.sitePosts, { URL: this.state.url } );
		if ( selectedPost ) {
			return selectedPost.ID;
		}
	},

	render: function() {
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
						<span>{ this.translate( 'URL' ) }</span>
						<FormTextInput
							ref="url"
							autoFocus={ true }
							onChange={ this.setUrl }
							value={ this.state.url }
							onKeyDown={ this.onInputKeyDown }
						/>
					</FormLabel>
					{ this.state.showLinkText ?
						<FormLabel>
							<span>{ this.translate( 'Link Text' ) }</span>
							<FormTextInput
								onChange={ this.setLinkText }
								value={ this.state.linkText }
								onKeyDown={ this.onInputKeyDown }
							/>
						</FormLabel>
					: null }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox onChange={ this.setNewWindow } checked={ this.state.newWindow } />
						<span>{ this.translate( 'Open link in a new window/tab' ) }</span>
					</FormLabel>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<span>{ this.translate( 'Link to existing content' ) }</span>
						{ this.props.site && (
							<PostSelector
								siteId={ this.props.site.ID }
								type="any"
								status="publish"
								orderBy="date"
								order="DESC"
								selected={ this.getSelectedPostId() }
								onChange={ this.setExistingContent }
								emptyMessage={ this.translate( 'No posts found' ) } />
						) }
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	}
} );

export default connect( ( state ) => {
	const selectedSite = getSelectedSite( state );
	return {
		site: selectedSite,
		sitePosts: selectedSite ? getSitePosts( state, selectedSite.ID ) : null
	};
} )( LinkDialog );
