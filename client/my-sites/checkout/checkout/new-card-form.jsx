/** @format */
import { isEmpty } from 'lodash';

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CreditCardFormFields from 'components/credit-card-form-fields';
import { setNewCreditCardDetails } from 'lib/upgrades/actions';

class NewCardForm extends Component {
	static displayName = 'NewCardForm';

	static propTypes = {
		countriesList: PropTypes.object.isRequired,
		hasStoredCards: PropTypes.bool.isRequired,
		transaction: PropTypes.object.isRequired,
	};

	isFieldInvalid = fieldName => {
		return ! isEmpty( this.props.transaction.errors[ fieldName ] );
	};

	render() {
		const classes = classNames( 'all-fields-required', {
			'has-saved-cards': this.props.hasStoredCards,
		} );

		return (
			<div className="new-card">
				<button type="button" className="new-card-toggle">
					{ this.props.translate( '+ Use a New Credit/Debit Card' ) }
				</button>

				<div className="new-card-fields">
					{ this.props.hasStoredCards ? (
						<h6 className="checkout__new-card-header">
							{ this.props.translate( 'Use New Credit/Debit Card' ) }:
						</h6>
					) : null }

					<span className={ classes }>{ this.props.translate( 'All fields required' ) }</span>

					<CreditCardFormFields
						card={ this.props.transaction.newCardFormFields }
						countriesList={ this.props.countriesList }
						eventFormName="Checkout Form"
						isFieldInvalid={ this.isFieldInvalid }
						onFieldChange={ this.handleFieldChange }
					/>
				</div>
			</div>
		);
	}

	handleFieldChange = ( rawDetails, maskedDetails ) => {
		setNewCreditCardDetails( {
			rawDetails: rawDetails,
			maskedDetails: maskedDetails,
		} );
	};
}

export default localize( NewCardForm );
