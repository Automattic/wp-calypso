/** @format */

/**
 * Internal dependencies
 */
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';
import edit from './edit';
import './editor.scss';

export const name = 'email-subscribe';

export const fields = [
	{ id: 'title', label: __( 'Title' ) },
	{ id: 'email_placeholder', label: __( 'Placeholder' ) },
	{ id: 'submit_label', label: __( 'Submit button label' ) },
	{ id: 'consent_text', label: __( 'Consent text' ) },
	{ id: 'processing_label', label: __( '"Processing" status message' ) },
	{ id: 'success_label', label: __( 'Success status message' ) },
	{ id: 'error_label', label: __( 'Error status message' ) },
];

export const settings = {
	title: __( 'Email Subscribe' ),
	icon: 'email',
	category: 'jetpack',
	keywords: [ __( 'email' ), __( 'mailchimp' ), 'jetpack' ],

	edit,
	attributes: fields.reduce( ( attrs, field ) => {
		attrs[ field.id ] = {
			type: 'string',
			default: '',
		};
		return attrs;
	}, {} ),

	save: function() {
		return null;
	},
};
