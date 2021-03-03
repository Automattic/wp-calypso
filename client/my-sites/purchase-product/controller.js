/**
 * External Dependencies
 */
import React from 'react';
import Debug from 'debug';
import { get, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { recordPageView } from 'calypso/lib/analytics/page-view';
import config from '@automattic/calypso-config';
import SearchPurchase from './search';
import { hideMasterbar, showMasterbar } from 'calypso/state/ui/actions';
import { ALLOWED_MOBILE_APP_REDIRECT_URL_LIST } from '../../jetpack-connect/constants';
import {
	persistMobileRedirect,
	retrieveMobileRedirect,
	storePlan,
} from '../../jetpack-connect/persistence-utils';

import {
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	PRODUCT_WPCOM_SEARCH,
	PRODUCT_WPCOM_SEARCH_MONTHLY,
} from 'calypso/lib/products-values/constants';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:purchase-product:controller' );
const analyticsPageTitleByType = {
	jetpack_search: 'Jetpack Search',
};

const getPlanSlugFromFlowType = ( type, interval = 'yearly' ) => {
	const planSlugs = {
		yearly: {
			jetpack_search: PRODUCT_JETPACK_SEARCH,
			wpcom_search: PRODUCT_WPCOM_SEARCH,
		},
		monthly: {
			jetpack_search: PRODUCT_JETPACK_SEARCH_MONTHLY,
			wpcom_search: PRODUCT_WPCOM_SEARCH_MONTHLY,
		},
	};

	return get( planSlugs, [ interval, type ], '' );
};

export function persistMobileAppFlow( context, next ) {
	const { query } = context;
	if ( config.isEnabled( 'jetpack/connect/mobile-app-flow' ) ) {
		if (
			some( ALLOWED_MOBILE_APP_REDIRECT_URL_LIST, ( pattern ) =>
				pattern.test( query.mobile_redirect )
			)
		) {
			debug( `In mobile app flow with redirect url: ${ query.mobile_redirect }` );
			persistMobileRedirect( query.mobile_redirect );
		} else {
			persistMobileRedirect( '' );
		}
	}
	next();
}

export function setMasterbar( context, next ) {
	if ( config.isEnabled( 'jetpack/connect/mobile-app-flow' ) ) {
		const masterbarToggle = retrieveMobileRedirect() ? hideMasterbar() : showMasterbar();
		context.store.dispatch( masterbarToggle );
	}
	next();
}

// Purchase Jetpack Search
export function purchase( context, next ) {
	const { path, pathname, params, query } = context;
	const { type = false, interval } = params;
	const analyticsPageTitle = get( type, analyticsPageTitleByType, 'Jetpack Connect' );
	const planSlug = getPlanSlugFromFlowType( type, interval );

	planSlug && storePlan( planSlug );
	recordPageView( pathname, analyticsPageTitle );

	context.primary = (
		<SearchPurchase
			ctaFrom={ query.cta_from /* origin tracking params */ }
			ctaId={ query.cta_id /* origin tracking params */ }
			locale={ params.locale }
			path={ path }
			type={ type }
			url={ query.url }
		/>
	);
	next();
}
