/**
 * External dependencies
 */
import page from 'page';
import { get } from 'lodash';

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
	page( paths.purchasesRoot() );
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

function enrichedSurveyData( surveyData, moment, site, purchase ) {
	const purchaseStartDate = get( purchase, 'subscribedDate', null );
	const siteStartDate = get( site, 'options.created_at', null );
	const purchaseId = get( purchase, 'id', null );
	const productSlug = get( purchase, 'productSlug', null );

	return Object.assign(
		{
			purchase: productSlug,
			purchaseId,
		},
		purchaseStartDate && {
			daysSincePurchase: moment.diff( purchaseStartDate, 'days', true ),
			newOrRenewal: moment.diff( purchaseStartDate, 'years', true ) > 1.0 ? 'renewal' : 'new purchase',
		},
		siteStartDate && {
			daysSinceSiteCreation: moment.diff( siteStartDate, 'days', true ),
		},
		surveyData,
	);
}

export {
	getPurchase,
	getSelectedSite,
	goToCancelPurchase,
	goToList,
	goToManagePurchase,
	isDataLoading,
	recordPageView,
	enrichedSurveyData,
};
