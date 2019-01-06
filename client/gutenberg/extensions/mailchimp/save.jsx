/** @format */

/**
 * External dependencies
 */
import { RichText } from '@wordpress/editor';
import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

class MailchimpSubscribeSave extends Component {
	render() {
		const { attributes } = this.props;
		const {
			emailPlaceholder,
			title,
			submitLabel,
			consentText,
			processingLabel,
			successLabel,
			errorLabel,
		} = attributes;
		return (
			<div className="components-placeholder">
				<RichText.Content tagName="h3" value={ title } />
				<form>
					<input
						type="text"
						className="components-text-control__input wp-block-jetpack-mailchimp-email"
						required
						placeholder={ emailPlaceholder }
					/>
					<button type="submit" className="components-button is-button is-primary">
						{ submitLabel }
					</button>
					<RichText.Content tagName="figcaption" value={ consentText } />
				</form>
				<div className="wp-block-jetpack-mailchimp-notification wp-block-jetpack-mailchimp-processing">
					{ processingLabel }
				</div>
				<div className="wp-block-jetpack-mailchimp-notification wp-block-jetpack-mailchimp-success">
					{ successLabel }
				</div>
				<div className="wp-block-jetpack-mailchimp-notification wp-block-jetpack-mailchimp-error">
					{ errorLabel }
				</div>
			</div>
		);
	}
}

export default MailchimpSubscribeSave;
