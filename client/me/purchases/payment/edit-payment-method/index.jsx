/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import EditPaymentMethodCreditCard from './credit-card';
import EditPaymentMethodPaypal from './paypal';
import HeaderCake from 'components/header-cake';
import { getPurchase, goToManagePurchase, isDataLoading, recordPageView } from 'me/purchases/utils';
import { isPaidWithCreditCard, isPaidWithPaypal } from 'lib/purchases';
import Main from 'components/main';
import titles from 'me/purchases/titles';

const EditPaymentMethod = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.object.isRequired
	},

	componentWillMount() {
		recordPageView( 'edit_payment_method', this.props );
	},

	componentWillReceiveProps( nextProps ) {
		recordPageView( 'edit_payment_method', this.props, nextProps );
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
					{ titles.editPaymentMethod }
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
