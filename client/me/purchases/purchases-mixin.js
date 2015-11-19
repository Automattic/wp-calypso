/**
 * External Dependencies
 */
import page from 'page';

/**
 * Internal Dependencies
 */
import paths from './paths';

export default {
	getPurchase() {
		return this.props.selectedPurchase.data;
	},

	goToList() {
		page( paths.list() );
	},

	goToEditCardDetails() {
		const { domain, id, payment: { creditCard } } = this.getPurchase();

		page( paths.editCardDetails( domain, id, creditCard.id ) );
	},

	goToEditPaymentMethod() {
		const { domain, id } = this.getPurchase();

		page( paths.editPaymentMethod( domain, id ) );
	},

	goToManagePurchase() {
		const { domain, id } = this.getPurchase();

		page( paths.managePurchase( domain, id ) );
	},

	isDataLoading() {
		return ( ! this.props.selectedSite || ! this.props.selectedPurchase.hasLoadedFromServer );
	}
};
