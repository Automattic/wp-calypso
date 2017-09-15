/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
var PropTypes = require('prop-types');
var React = require( 'react' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var CreditCardFormFields = require( 'components/credit-card-form-fields' ),
	upgradesActions = require( 'lib/upgrades/actions' );

module.exports = React.createClass( {
	displayName: 'NewCardForm',

	propTypes: {
		countriesList: PropTypes.object.isRequired,
		hasStoredCards: PropTypes.bool.isRequired,
		transaction: PropTypes.object.isRequired
	},

	isFieldInvalid: function( fieldName ) {
		return ! isEmpty( this.props.transaction.errors[ fieldName ] );
	},

	render: function() {
		let classes = classNames( 'all-fields-required', { 'has-saved-cards': this.props.hasStoredCards } );

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
