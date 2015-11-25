/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
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

function recordPageView( trackingSlug, props, nextProps = null ) {
	if ( isDataLoading( nextProps || props ) ) {
		return null;
	}

	if ( nextProps &&
		( props.selectedPurchase.hasLoadedFromServer || ! nextProps.selectedPurchase.hasLoadedFromServer ) ) {
		// only record the page view the first time the purchase loads from the server
		return null;
	}

	const { productSlug } = getPurchase( nextProps || props );

	analytics.tracks.recordEvent( `calypso_${ trackingSlug }_purchase_view`, { product_slug: productSlug } );
}

export {
	getPurchase,
	goToList,
	goToEditCardDetails,
	goToManagePurchase,
	isDataLoading,
	recordPageView
}
