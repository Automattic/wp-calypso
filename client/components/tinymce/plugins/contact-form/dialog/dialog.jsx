/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormButton from 'components/forms/form-button';

const FormItem = React.createClass( {
	onClick() {
		this.props.onClick( this.props.index );
	},

	render() {
		return <li>{ this.props.label } <a onClick={ this.onClick }>Remove</a></li>
	}
} );

export default React.createClass( {
	displayName: 'ContactFormDialog',

	propTypes: {
		showDialog: PropTypes.bool.isRequired,
		contactForm: PropTypes.shape( {
			to: PropTypes.string,
			subject: PropTypes.string,
			fields: PropTypes.array.isRequired
		} ).isRequired,
		onAdd: PropTypes.func.isRequired,
		onRemove: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired
	},

	render() {
		const buttons = [
			<FormButton
				key="save"
				onClick={ this.props.onSave } >
				{ this.translate( 'Save' ) }
			</FormButton>,
			<FormButton
				key="cancel"
				isPrimary={ false }
				onClick={ this.props.onClose } >
				{ this.translate( 'Cancel' ) }
			</FormButton>
		];

		return (
			<Dialog
				isVisible={ this.props.showDialog }
				onClose={ this.props.onClose }
				buttons={ buttons }
				additionalClassNames="contact-form__dialog" >
				<FormFieldset>
					<FormLabel>Here be dragons. Click Save to add a generic contact form...</FormLabel>
				</FormFieldset>
				<div>
				<ul>
					{ this.props.contactForm.fields.map( ( field, index ) => (
						<FormItem
							key={ index }
							index={ index }
							label={ field.label }
							onClick={ this.props.onRemove } />
					) ) }
				</ul>
				</div>
				<FormFieldset>
					<FormButton onClick={ this.props.onAdd }>Add New Field</FormButton>
				</FormFieldset>
			</Dialog>
		);
	}
} );
