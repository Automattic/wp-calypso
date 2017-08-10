/**
 * External dependencies
 */
var React = require( 'react' ),
	isEmpty = require( 'lodash/isEmpty' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var CreditCardFormFields = require( 'components/credit-card-form-fields' ),
	upgradesActions = require( 'lib/upgrades/actions' );

module.exports = localize(class extends React.Component {
    static displayName = 'NewCardForm';

	static propTypes = {
		countriesList: React.PropTypes.object.isRequired,
		hasStoredCards: React.PropTypes.bool.isRequired,
		transaction: React.PropTypes.object.isRequired
	};

	isFieldInvalid = fieldName => {
		return ! isEmpty( this.props.transaction.errors[ fieldName ] );
	};

	render() {
		let classes = classNames( 'all-fields-required', { 'has-saved-cards': this.props.hasStoredCards } );

		return (
		    <div className="new-card">
				<button type="button" className="new-card-toggle">
					{ this.props.translate( '+ Use a New Credit/Debit Card' ) }
				</button>

				<div className="new-card-fields">
					{ this.props.hasStoredCards ?
						<h6 className="new-card-header">{ this.props.translate( 'Use New Credit/Debit Card' ) }:</h6> : null
					}

					<span className={ classes }>{ this.props.translate( 'All fields required' ) }</span>

					<CreditCardFormFields
						card={ this.props.transaction.newCardFormFields }
						countriesList={ this.props.countriesList }
						eventFormName="Checkout Form"
						isFieldInvalid={ this.isFieldInvalid }
						onFieldChange={ this.handleFieldChange } />
				</div>
			</div>
		);
	}

	handleFieldChange = (rawDetails, maskedDetails) => {
		upgradesActions.setNewCreditCardDetails( {
			rawDetails: rawDetails,
			maskedDetails: maskedDetails
		} );
	};
});
