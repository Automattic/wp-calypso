/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { Dialog } from '@automattic/components';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import PostSelector from 'my-sites/post-selector';

const REGEXP_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const REGEXP_URL = /^(https?|ftp):\/\/[A-Z0-9.-]+\.[A-Z]{2,4}[^ "]*$/i;
const REGEXP_STANDALONE_URL = /^(?:[a-z]+:|#|\?|\.|\/)/;

export class AddLinkDialog extends Component {
	static propTypes = {
		onClose: PropTypes.func,
		onInsert: PropTypes.func,
		selectedText: PropTypes.string,
		shouldDisplay: PropTypes.bool,
		siteId: PropTypes.number,
		translate: PropTypes.func,
	};

	state = {
		linkNewTab: false,
		linkText: '',
		linkUrl: '',
		selectedPost: { id: null, url: null },
	};

	UNSAFE_componentWillReceiveProps( newProps ) {
		this.setState( {
			linkUrl: this.inferUrl( newProps.selectedText ),
			linkText: newProps.selectedText,
		} );
	}

	correctUrl() {
		const url = this.state.linkUrl.trim();
		if ( REGEXP_EMAIL.test( url ) ) {
			return `mailto:${ url }`;
		}
		if ( ! REGEXP_STANDALONE_URL.test( url ) ) {
			return `http://${ url }`;
		}
		return url;
	}

	inferUrl( selectedText ) {
		if ( REGEXP_EMAIL.test( selectedText ) ) {
			return 'mailto:' + selectedText;
		} else if ( REGEXP_URL.test( selectedText ) ) {
			return selectedText.replace( /&amp;|&#0?38;/gi, '&' );
		}
		return '';
	}

	bindLinkUrlRef = ( input ) => {
		this.linkUrl = input;
	};

	setLinkUrl = ( event ) => {
		const { selectedPost } = this.state;
		this.setState( {
			linkUrl: event.target.value,
			selectedPost:
				selectedPost.url === event.target.value ? selectedPost : { id: null, url: null },
		} );
	};

	setLinkText = ( event ) => {
		this.setState( { linkText: event.target.value } );
	};

	setLinkNewTab = ( event ) => {
		this.setState( { linkNewTab: event.target.checked } );
	};

	onSelectPost = ( post ) => {
		this.setState( {
			linkUrl: post.URL,
			selectedPost: { id: post.ID, url: post.URL },
		} );
	};

	onCloseDialog = () => {
		this.setState( {
			linkNewTab: false,
			linkText: '',
			linkUrl: '',
			selectedPost: { id: null, url: null },
		} );
		this.props.onClose();
	};

	onInsertLink = () => {
		const { linkNewTab, linkText } = this.state;
		this.props.onInsert(
			{
				href: this.correctUrl(),
				target: linkNewTab ? '_blank' : '',
			},
			linkText
		);
		this.onCloseDialog();
	};

	render() {
		const { shouldDisplay, siteId, translate } = this.props;
		const { linkNewTab, linkText, linkUrl, selectedPost } = this.state;

		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'add-link',
				isPrimary: true,
				label: translate( 'Add Link' ),
				onClick: this.onInsertLink,
			},
		];

		return (
			<Dialog
				isVisible={ shouldDisplay }
				buttons={ buttons }
				onClose={ this.onCloseDialog }
				additionalClassNames="editor-html-toolbar__dialog"
			>
				<FormFieldset>
					<FormLabel htmlFor="link_url">{ translate( 'URL' ) }</FormLabel>
					<FormTextInput
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						id="link_url"
						name="link_url"
						onChange={ this.setLinkUrl }
						ref={ this.bindLinkUrlRef }
						value={ linkUrl }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="link_text">{ translate( 'Link Text' ) }</FormLabel>
					<FormTextInput
						id="link_text"
						name="link_text"
						onChange={ this.setLinkText }
						value={ linkText }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<FormCheckbox
							checked={ linkNewTab }
							name="link_new_tab"
							onChange={ this.setLinkNewTab }
						/>
						<span>{ translate( 'Open link in a new window/tab' ) }</span>
					</FormLabel>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						<span>{ translate( 'Link to existing content' ) }</span>
					</FormLabel>
					<PostSelector
						emptyMessage={ translate( 'No posts found' ) }
						onChange={ this.onSelectPost }
						order="DESC"
						orderBy="date"
						selected={ selectedPost.id }
						showTypeLabels
						siteId={ siteId }
						type="any"
						excludePrivateTypes={ true }
					/>
				</FormFieldset>
			</Dialog>
		);
	}
}

export default connect( ( state ) => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( AddLinkDialog ) );
