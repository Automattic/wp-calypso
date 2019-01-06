/** @format */

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';
import save from './save';
import './editor.scss';

export const name = 'mailchimp';

export const settings = {
	title: __( 'MailChimp' ),
	icon: 'email',
	category: 'jetpack',
	keywords: [ __( 'email' ), __( 'mailchimp' ) ],
	attributes: {
		title: {
			type: 'string',
			default: __( 'Join my email list' ),
		},
		emailPlaceholder: {
			type: 'string',
			default: __( 'Enter your email' ),
		},
		submitLabel: {
			type: 'string',
			default: __( 'Join My Email List' ),
		},
		consentText: {
			type: 'string',
			default: __(
				'By clicking submit, you agree to share your email address with the site owner and MailChimp to receive marketing, updates, and other emails from the site owner. Use the unsubscribe link in those emails to opt out at any time.'
			),
		},
		processingLabel: {
			type: 'string',
			default: __( 'Processing...' ),
		},
		successLabel: {
			type: 'string',
			default: __( "Success! You've been added to the list." ),
		},
		errorLabel: {
			type: 'string',
			default: __(
				'Oh no! Unfortunately there was an error. Please try reloading this page and adding your email once more.'
			),
		},
	},
	edit,
	save,
};
