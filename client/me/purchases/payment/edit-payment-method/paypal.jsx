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
import { getPurchase } from 'me/purchases/utils';
import { successNotice } from 'state/notices/actions';

const EditPaymentMethodPaypal = React.createClass( {
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
			// TODO: Add action that calls the API and deletes the account

			this.props.successNotice( this.translate( 'The PayPal information was deleted successfully.' ) );
		}
	},

	showDialog() {
		this.setState( { showDialog: true } );
	},

	renderDialog() {
		const buttons = [
			{ action: 'cancel', label: this.translate( 'Cancel' ) },
			{ action: 'delete', label: this.translate( 'Remove Paypal', { context: 'Button label' } ), isPrimary: true }
		];

		return (
			<Dialog
				buttons={ buttons }
				isVisible={ this.state.showDialog }
				onClose={ this.closeDialog }>
				<h1>{ this.translate( 'Confirm Deletion' ) }</h1>

				<p>
					{ this.translate( 'Please confirm that you wish to delete your PayPal information.' ) }
					{ ' ' }
					{ this.translate( 'Please note that this account will only be removed for this purchase.' ) }
				</p>
			</Dialog>
		);
	},

	renderHeader() {
		const classes = classNames(
			'edit-payment-method__header',
			'manage-purchase__payment-detail',
			'is-paypal'
		);

		return (
			<div className={ classes }>
				{ this.translate( 'Account Name: %(name)s', { args: { name: getPurchase( this.props ).payment.name } } ) }
			</div>
		);
	},

	renderCard() {
		return (
			<FoldableCard header={ this.renderHeader() } screenReaderText={ this.translate( 'More' ) }>
				<div className="edit-payment-method__details is-paypal">
					<strong>{ this.translate( 'Name on Account', { context: 'Input field description', comment: 'PayPal account' } ) }</strong>
					<span>{ getPurchase( this.props ).payment.name }</span>
				</div>

				<div className="edit-payment-method__actions">
					<Button onClick={ this.showDialog }>
						{ this.translate( 'Remove Account', { context: 'Button label', comment: 'PayPal account' } ) }
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
)( EditPaymentMethodPaypal );
