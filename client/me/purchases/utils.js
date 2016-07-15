/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import paths from './paths';

// TODO: Remove these property-masking functions in favor of accessing the props directly
function getPurchase( props ) {
	return props.selectedPurchase;
}

function getSelectedSite( props ) {
	return props.selectedSite;
}

function goToCancelPurchase( props ) {
	const { id } = getPurchase( props ),
		{ slug } = getSelectedSite( props );

	page( paths.cancelPurchase( slug, id ) );
}

function goToList() {
	page( paths.list() );
}

function goToManagePurchase( props ) {
	const { id } = getPurchase( props ),
		{ slug } = getSelectedSite( props );

	page( paths.managePurchase( slug, id ) );
}

function isDataLoading( props ) {
	return ! props.hasLoadedSites || ! props.hasLoadedUserPurchasesFromServer;
}

function recordPageView( trackingSlug, props, nextProps = null ) {
	if ( isDataLoading( nextProps || props ) ) {
		return null;
	}

	if ( nextProps &&
		( props.hasLoadedUserPurchasesFromServer || ! nextProps.hasLoadedUserPurchasesFromServer ) ) {
		// only record the page view the first time the purchase loads from the server
		return null;
	}

	const purchase = getPurchase( nextProps || props );

	if ( ! purchase ) {
		return null;
	}

	const { productSlug } = purchase;

	analytics.tracks.recordEvent( `calypso_${ trackingSlug }_purchase_view`, { product_slug: productSlug } );
}

export {
	getPurchase,
	getSelectedSite,
	goToCancelPurchase,
	goToList,
	goToManagePurchase,
	isDataLoading,
	recordPageView
};
