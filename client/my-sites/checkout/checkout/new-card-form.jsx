/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { defer } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import CreditCardFormFields from 'components/credit-card-form-fields';
import { setNewCreditCardDetails } from 'lib/transaction/actions';
import { INPUT_VALIDATION } from 'lib/store-transactions/step-types';

class NewCardForm extends Component {
	static displayName = 'NewCardForm';

	static propTypes = {
		countriesList: PropTypes.array.isRequired,
		hasStoredCards: PropTypes.bool.isRequired,
		transaction: PropTypes.object.isRequired,
		selected: PropTypes.bool,
	};

	getErrorMessage = ( fieldName ) => {
		const { transaction } = this.props;
		return transaction.step.name === INPUT_VALIDATION && transaction.errors[ fieldName ];
	};

	getFields = () => {
		return (
			<CreditCardFormFields
				card={ this.props.transaction.newCardFormFields }
				countriesList={ this.props.countriesList }
				isNewTransaction={ !! this.props.transaction }
				eventFormName="Checkout Form"
				onFieldChange={ this.handleFieldChange }
				getErrorMessage={ this.getErrorMessage }
			/>
		);
	};

	render() {
		const { hasStoredCards, translate, selected } = this.props;

		return (
			<div className="checkout__new-card">
				<button type="button" className="checkout__new-card-toggle">
					{ translate( '+ Use a New Credit/Debit Card' ) }
				</button>

				<div className="checkout__new-card-fields">
					{ hasStoredCards ? (
						<h6 className="checkout__new-card-header">
							{ translate( 'Use New Credit/Debit Card' ) }:
						</h6>
					) : null }

					{ ( selected || ! hasStoredCards ) && this.getFields() }
				</div>
			</div>
		);
	}

	handleFieldChange = ( rawDetails, maskedDetails ) => {
		// Because SecurePaymentForm::setInitialPaymentDetails() initializes
		// the payment details via a defer() call, this must be deferred as
		// well (to ensure that we only try to update credit card details after
		// the credit card data has been set up). If the defer() call is ever
		// removed from SecurePaymentForm::setInitialPaymentDetails(), it can
		// likely be removed here too.
		defer( setNewCreditCardDetails, {
			rawDetails: rawDetails,
			maskedDetails: maskedDetails,
		} );
	};
}

export default localize( NewCardForm );
