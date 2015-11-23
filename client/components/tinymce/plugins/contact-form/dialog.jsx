/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Shortcode from 'lib/shortcode';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormButton from 'components/forms/form-button';

/**
 * object constants
 */
const fieldTypes = {
	name: 'name',
	email: 'email',
	url: 'url',
	checkbox: 'checkbox',
	dropdown: 'dropdown',
	radio: 'radio',
	text: 'text',
	textarea: 'textarea',
	website: 'website'
};

const defaultForm = [
	{ label: 'Name', type: fieldTypes.name, required: true },
	{ label: 'Email', type: fieldTypes.email, required: true },
	{ label: 'Website', type: fieldTypes.url },
	{ label: 'Comment', type: fieldTypes.textarea, required: true }
];

export default React.createClass( {
	displayName: 'ContactFormDialog',

	propTypes: {
		onClose: PropTypes.func.isRequired,
		onInsertMedia: PropTypes.func.isRequired,
		showDialog: PropTypes.bool.isRequired
	},

	render() {
		const buttons = [
			<FormButton
				key="save"
				onClick={ () => {
					const fields = defaultForm.map( field => {
						return Shortcode.stringify( {
							tag: 'contact-field',
							type: 'self-closing',
							attrs: {
								label: field.label,
								type: field.type,
								required: field.required ? 1 : 0
							}
						} );
					} ).join( '' );

					const shortcode = Shortcode.stringify( {
						tag: 'contact-form',
						type: 'closed',
						content: fields,
						attrs: {
							to: 'user@example.com',
							subject: 'this is a contact form'
						}
					} );

					this.props.onInsertMedia( shortcode );
				} }
			>
				{ this.translate( 'Save' ) }
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				onClick={ this.props.onClose }
			>
				{ this.translate( 'Cancel' ) }
			</FormButton>
		];

		return (
			<Dialog
				isVisible={ this.props.showDialog }
				onClose={ this.props.onClose }
				buttons={ buttons }
				additionalClassNames="contact-form__dialog"
			>
				<FormFieldset>
					<FormLabel>
						<span>Here be dragons. Click Save to add a generic contact form...</span>
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	}
} );
