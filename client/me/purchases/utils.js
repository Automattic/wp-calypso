/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import paths from './paths';

function getPurchase( props ) {
	return props.selectedPurchase.data;
}

function goToList() {
	page( paths.list() );
}

function goToEditCardDetails( props ) {
	const { domain, id, payment: { creditCard } } = getPurchase( props );

	page( paths.editCardDetails( domain, id, creditCard.id ) );
}

function goToManagePurchase( props ) {
	const { domain, id } = getPurchase( props );

	page( paths.managePurchase( domain, id ) );
}

function isDataLoading( props ) {
	return ( ! props.selectedSite || ! props.selectedPurchase.hasLoadedFromServer );
}

export {
	getPurchase,
	goToList,
	goToEditCardDetails,
	goToManagePurchase,
	isDataLoading
}
