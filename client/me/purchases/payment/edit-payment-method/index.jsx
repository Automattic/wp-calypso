/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import EditPaymentMethodPaypal from './paypal';
import EditPaymentMethodCreditCard from './credit-card';
import HeaderCake from 'components/header-cake';
import { isPaidWithCreditCard, isPaidWithPaypal } from 'lib/purchases';
import Main from 'components/main';
import purchasesMixin from '../../purchases-mixin';

const EditPaymentMethod = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	mixins: [ purchasesMixin ],

	render() {
		if ( this.isDataLoading() ) {
			return (
				<Main className="edit-payment-method">
					{ this.translate( 'Loading…' ) }
				</Main>
			);
		}

		const purchase = this.getPurchase();

		return (
			<Main className="edit-payment-method">
				<HeaderCake onClick={ this.goToManagePurchase }>
					{ this.translate( 'Edit Payment Method' ) }
				</HeaderCake>

				<h2>
					{ this.translate( 'Stored Payment Information' ) }
				</h2>

				{ isPaidWithPaypal( purchase ) && <EditPaymentMethodPaypal
					selectedPurchase={ this.props.selectedPurchase }
					selectedSite={ this.props.selectedSite } /> }

				{ isPaidWithCreditCard( purchase ) && <EditPaymentMethodCreditCard
					selectedPurchase={ this.props.selectedPurchase }
					selectedSite={ this.props.selectedSite } />}
			</Main>
		);
	}
} );

export default EditPaymentMethod;
