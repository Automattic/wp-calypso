/**
 * External dependencies
 */
import { Path, SVG } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';
import './editor.scss';

export const name = 'mailchimp';

export const icon = (
	<SVG xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<Path fill="none" d="M0 0h24v24H0V0z" />
		<Path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
	</SVG>
);

export const settings = {
	title: __( 'MailChimp' ),
	icon,
	description: __( 'A form enabling readers to join a Mailchimp list.' ),
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
			default: __( 'Processing…' ),
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
	save: () => null,
};
