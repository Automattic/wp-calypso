/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextarea from 'components/forms/form-textarea';
import FormTextInput from 'components/forms/form-text-input';

class PaymentMethodCheque extends Component {
	static propTypes = {
		method: PropTypes.shape( {
			settings: PropTypes.shape( {
				title: PropTypes.shape( {
					id: PropTypes.string.isRequired,
					label: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
					value: PropTypes.string.isRequired,
				} ),
			} ),
		} ),
		translate: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onEditField: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
	};

	onEditFieldHandler = ( e ) => {
		this.props.onEditField( e.target.name, e.target.value );
	};

	buttons = [
		{ action: 'cancel', label: this.props.translate( 'Cancel' ), onClick: this.props.onCancel },
		{
			action: 'save',
			label: this.props.translate( 'Done' ),
			onClick: this.props.onDone,
			isPrimary: true,
		},
	];

	render() {
		const {
			method,
			method: { settings },
			translate,
		} = this.props;
		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.buttons }
				isVisible
			>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Title' ) }</FormLabel>
					<FormTextInput
						name="title"
						onChange={ this.onEditFieldHandler }
						value={ settings.title.value }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Instructions for customer at checkout' ) }</FormLabel>
					<FormTextarea
						name="description"
						onChange={ this.onEditFieldHandler }
						value={ method.description }
						placeholder={ translate( 'Pay for this order by check.' ) }
					/>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						{ translate( 'Instructions for customer in order email notification' ) }
					</FormLabel>
					<FormTextarea
						name="instructions"
						onChange={ this.onEditFieldHandler }
						value={ settings.instructions.value }
						placeholder={ translate( 'Make your check payable to…' ) }
					/>
				</FormFieldset>
			</Dialog>
		);
	}
}

export default localize( PaymentMethodCheque );
