/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { defer } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CreditCardFormFields from 'components/credit-card-form-fields';
import { setNewCreditCardDetails } from 'lib/upgrades/actions';
import { INPUT_VALIDATION } from 'lib/store-transactions/step-types';

class NewCardForm extends Component {
	static displayName = 'NewCardForm';

	static propTypes = {
		countriesList: PropTypes.object.isRequired,
		hasStoredCards: PropTypes.bool.isRequired,
		transaction: PropTypes.object.isRequired,
	};

	getErrorMessage = fieldName => {
		const { transaction } = this.props;
		return transaction.step.name === INPUT_VALIDATION && transaction.errors[ fieldName ];
	};

	render() {
		const { countriesList, hasStoredCards, translate, transaction } = this.props;
		const classes = classNames( 'all-fields-required', {
			'has-saved-cards': this.props.hasStoredCards,
		} );

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

					<span className={ classes }>{ translate( 'All fields required' ) }</span>

					<CreditCardFormFields
						card={ transaction.newCardFormFields }
						countriesList={ countriesList }
						eventFormName="Checkout Form"
						onFieldChange={ this.handleFieldChange }
						getErrorMessage={ this.getErrorMessage }
					/>
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
