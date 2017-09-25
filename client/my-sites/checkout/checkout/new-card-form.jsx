/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CreditCardFormFields from 'components/credit-card-form-fields';

import upgradesActions from 'lib/upgrades/actions';

export default React.createClass( {
	displayName: 'NewCardForm',

	propTypes: {
		countriesList: React.PropTypes.object.isRequired,
		hasStoredCards: React.PropTypes.bool.isRequired,
		transaction: React.PropTypes.object.isRequired
	},

	isFieldInvalid: function( fieldName ) {
		return ! isEmpty( this.props.transaction.errors[ fieldName ] );
	},

	render: function() {
		const classes = classNames( 'all-fields-required', { 'has-saved-cards': this.props.hasStoredCards } );

		return (
			<div className="new-card">
				<button type="button" className="new-card-toggle">
					{ this.translate( '+ Use a New Credit/Debit Card' ) }
				</button>

				<div className="new-card-fields">
					{ this.props.hasStoredCards ?
						<h6 className="new-card-header">{ this.translate( 'Use New Credit/Debit Card' ) }:</h6> : null
					}

					<span className={ classes }>{ this.translate( 'All fields required' ) }</span>

					<CreditCardFormFields
						card={ this.props.transaction.newCardFormFields }
						countriesList={ this.props.countriesList }
						eventFormName="Checkout Form"
						isFieldInvalid={ this.isFieldInvalid }
						onFieldChange={ this.handleFieldChange } />
				</div>
			</div>
		);
	},

	handleFieldChange: function( rawDetails, maskedDetails ) {
		upgradesActions.setNewCreditCardDetails( {
			rawDetails: rawDetails,
			maskedDetails: maskedDetails
		} );
	}
} );
