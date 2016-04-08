/**
 * External Dependencies
 */
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import React from 'react';

/**
 * Internal Dependencies
 */
import Button from 'components/button';
import classNames from 'classnames';
import Dialog from 'components/dialog';
import FoldableCard from 'components/foldable-card';
import { getPurchase, goToEditCardDetails } from 'me/purchases/utils';
import { successNotice } from 'state/notices/actions';

const EditPaymentMethodCreditCard = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired,
		successNotice: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			showDialog: false
		};
	},

	closeDialog( action ) {
		this.setState( { showDialog: false } );

		if ( action === 'delete' ) {
			// TODO: Add action that calls the API and deletes the card

			this.props.successNotice( this.translate( 'The credit card was deleted successfully.' ) );
		}
	},

	showDialog() {
		this.setState( { showDialog: true } );
	},

	renderDialog() {
		const buttons = [
				{ action: 'cancel', label: this.translate( 'Cancel' ) },
				{ action: 'delete', label: this.translate( 'Delete Card' ), isPrimary: true }
			],
			{ payment: { creditCard } } = getPurchase( this.props );

		return (
			<Dialog
				buttons={ buttons }
				isVisible={ this.state.showDialog }
				onClose={ this.closeDialog }>
				<h1>{ this.translate( 'Confirm Credit Card Deletion' ) }</h1>

				<p>
					{ this.translate( 'Please confirm that you wish to delete this credit card: {{strong}}%(type)s - ending in %(number)d{{/strong}}.', {
						args: {
							type: creditCard.type.toUpperCase(),
							number: creditCard.number
						},
						components: {
							strong: <strong />
						},
						context: "type is a credit card type (e.g. 'VISA'), number is the last four digits of a credit card"
					} ) }
					{ ' ' }
					{ this.translate( 'Please note that this card will only be removed for this purchase.' ) }
				</p>
			</Dialog>
		);
	},

	renderHeader() {
		const { payment: { creditCard } } = getPurchase( this.props ),
			classes = classNames(
				'edit-payment-method__header',
				'manage-purchase__payment-detail',
				'is-' + creditCard.type
			);

		return (
			<div className={ classes }>
				<strong>
					{ this.translate( '%(type)s - Ending in %(number)d', {
						args: {
							type: creditCard.type.toUpperCase(),
							number: creditCard.number
						},
						context: "type is a credit card type (e.g. 'VISA'), number is the last four digits of a credit card"
					} ) }
				</strong>
				<em>
					{ this.translate( 'Expires %(date)s', {
						args: { date: creditCard.expiryDate },
						context: 'date is of the form MM/YY'
					} ) }
				</em>
			</div>
		);
	},

	renderCard() {
		const { payment } = getPurchase( this.props );

		return (
			<FoldableCard header={ this.renderHeader() } screenReaderText={ this.translate( 'More' ) }>
				<div className="edit-payment-method__details">
					<strong>{ this.translate( 'Name on Card', { context: 'Input field description', comment: 'Credit card' } ) }</strong>
					<span>{ payment.name }</span>

					<strong >{ this.translate( 'Country' ) }</strong>
					<span>{ payment.countryName }</span>
				</div>

				<div className="edit-payment-method__actions">
					<Button onClick={ goToEditCardDetails.bind( null, this.props ) }>
						{ this.translate( 'Edit Card Details', { context: 'Button label', comment: 'Credit card' } ) }
					</Button>

					<Button onClick={ this.showDialog }>
						{ this.translate( 'Delete Card', { context: 'Button label', comment: 'Credit card' } ) }
					</Button>
				</div>
			</FoldableCard>
		);
	},

	render() {
		return (
			<div>
				{ this.renderCard() }
				{ this.renderDialog() }
			</div>
		);
	}
} );

export default connect(
	null,
	dispatch => bindActionCreators( { successNotice }, dispatch )
)( EditPaymentMethodCreditCard );
