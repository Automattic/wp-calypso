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
import { getPurchase, goToManagePurchase, isDataLoading } from 'me/purchases/helper';

const EditPaymentMethod = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	render() {
		if ( isDataLoading( this.props ) ) {
			return (
				<Main className="edit-payment-method">
					{ this.translate( 'Loading…' ) }
				</Main>
			);
		}

		const purchase = getPurchase( this.props );

		return (
			<Main className="edit-payment-method">
				<HeaderCake onClick={ goToManagePurchase.bind( null, this.props ) }>
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
