/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';

// @see components/tinymce/plugins/wplink/dialog.jsx
const REGEXP_EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const REGEXP_URL = /^(https?|ftp):\/\/[A-Z0-9.-]+\.[A-Z]{2,4}[^ "]*$/i;
const REGEXP_STANDALONE_URL = /^(?:[a-z]+:|#|\?|\.|\/)/;

export class AddLinkDialog extends Component {
	static propTypes = {
		onClose: PropTypes.func,
		onInsert: PropTypes.func,
		selectedText: PropTypes.string,
		shouldDisplay: PropTypes.bool,
		translate: PropTypes.func,
	};

	state = {
		linkNewTab: false,
		linkText: '',
		linkUrl: '',
	};

	componentWillReceiveProps( newProps ) {
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

	setLinkUrl = event => this.setState( { linkUrl: event.target.value } );

	setLinkText = event => this.setState( { linkText: event.target.value } );

	setLinkNewTab = event => this.setState( { linkNewTab: event.target.checked } );

	closeDialog = () =>
		this.setState(
			{
				linkNewTab: false,
				linkText: '',
				linkUrl: '',
			},
			this.props.onClose
		);

	insertATag = () => {
		const { linkNewTab, linkText } = this.state;
		this.props.onInsert(
			{
				href: this.correctUrl(),
				...( linkNewTab ? { target: '_blank' } : {} ),
			},
			linkText
		);
		this.closeDialog();
	};

	render() {
		const { shouldDisplay, translate } = this.props;
		const { linkNewTab, linkText, linkUrl } = this.state;

		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'add-link',
				isPrimary: true,
				label: translate( 'Add Link' ),
				onClick: this.insertATag,
			},
		];

		return (
			<Dialog
				isVisible={ shouldDisplay }
				buttons={ buttons }
				onClose={ this.closeDialog }
				additionalClassNames="comment-html-editor__dialog"
			>
				<FormFieldset>
					<FormLabel htmlFor="link_url">{ translate( 'URL' ) }</FormLabel>
					<FormTextInput name="link_url" onChange={ this.setLinkUrl } value={ linkUrl } />
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="link_text">{ translate( 'Link Text' ) }</FormLabel>
					<FormTextInput name="link_text" onChange={ this.setLinkText } value={ linkText } />
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
			</Dialog>
		);
	}
}

export default localize( AddLinkDialog );
