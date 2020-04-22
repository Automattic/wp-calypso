/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import config from 'config';
import { getCurrentUser } from 'state/current-user/selectors';
import getPrimarySiteId from 'state/selectors/get-primary-site-id';
import getPrimarySiteSlug from 'state/selectors/get-primary-site-slug';
import { getSitePurchases } from 'state/purchases/selectors';
import { fetchSitePurchases } from 'state/purchases/actions';
import {
	JETPACK_SCAN_PRODUCTS,
	PRODUCT_JETPACK_SCAN,
	JETPACK_BACKUP_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
} from 'lib/products-values/constants';
import { getPlan, planHasFeature } from 'lib/plans';
import { requestSite } from 'state/sites/actions';

export default function () {
	page( '/', async ( context ) => {
		let redirectPath = '/error';

		if ( config.isEnabled( 'jetpack-cloud/backups' ) ) {
			redirectPath = '/backups';
		} else if ( config.isEnabled( 'jetpack-cloud/scan' ) ) {
			redirectPath = '/scan';
		}

		const { querystring } = context;
		if ( querystring ) {
			redirectPath += `?${ querystring }`;
		}

		// Gets the primary blog and checks if it's Jetpack.
		const { getState, dispatch } = context.store;
		const user = getCurrentUser( getState() );
		if ( ! user.primary_blog_is_jetpack ) {
			page.redirect( redirectPath );
			return;
		}

		// If it is, get the slug.
		const primarySiteId = getPrimarySiteId( getState() );
		let primarySiteSlug = getPrimarySiteSlug( getState() );
		if ( ! primarySiteSlug ) {
			await dispatch( requestSite( primarySiteId ) );
			primarySiteSlug = getPrimarySiteSlug( getState() );
		}

		// Get purchases for primary site.
		// TODO: Use better method to detect capabilities.
		let purchases = getSitePurchases( getState(), primarySiteId );
		if ( ! purchases.length ) {
			await dispatch( fetchSitePurchases( primarySiteId ) );
			purchases = getSitePurchases( getState(), primarySiteId );
		}

		// From purchases, build proper URL.
		const primarySiteManageUrl = getRedirectFromPurchases( purchases, primarySiteSlug );
		if ( primarySiteManageUrl ) {
			redirectPath = `${ primarySiteManageUrl }?${ querystring }`;
		}

		page.redirect( redirectPath );
	} );
}

function getRedirectFromPurchases( purchases, primarySiteSlug ) {
	let redirectPath = null;

	// Iterate over each purchase and determine if it has scan or backups.
	let hasBackupProduct = false;
	let hasScanProduct = false;
	purchases.forEach( ( { productSlug } ) => {
		if (
			! hasBackupProduct && // Don't test for backups if we already have it.
			( JETPACK_BACKUP_PRODUCTS.includes( productSlug ) ||
				( getPlan( productSlug ) && planHasFeature( productSlug, PRODUCT_JETPACK_BACKUP_DAILY ) ) )
		) {
			hasBackupProduct = true;
			return;
		}
		if (
			! hasScanProduct &&
			( JETPACK_SCAN_PRODUCTS.includes( productSlug ) ||
				( getPlan( productSlug ) && planHasFeature( productSlug, PRODUCT_JETPACK_SCAN ) ) )
		) {
			hasScanProduct = true;
		}
	} );
	if ( hasBackupProduct && config.isEnabled( 'jetpack-cloud/backups' ) ) {
		redirectPath = `/backups/${ primarySiteSlug }/`;
	} else if ( hasScanProduct && config.isEnabled( 'jetpack-cloud/scan' ) ) {
		redirectPath = `/scan/${ primarySiteSlug }/`;
	}

	return redirectPath;
}
