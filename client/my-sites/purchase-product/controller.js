/**
 * External Dependencies
 */
import React from 'react';
import Debug from 'debug';
import { get, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { recordPageView } from 'lib/analytics/page-view';
import config from 'config';
import SearchPurchase from './search';
import { hideMasterbar, showMasterbar, hideSidebar } from 'state/ui/actions';
import { MOBILE_APP_REDIRECT_URL_WHITELIST } from '../../jetpack-connect/constants';
import {
	persistMobileRedirect,
	retrieveMobileRedirect,
	storePlan,
} from '../../jetpack-connect/persistence-utils';

import {
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
} from 'lib/products-values/constants';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:jetpack-connect:controller' );
const analyticsPageTitleByType = {
	jetpack_search: 'Jetpack Search',
};

const removeSidebar = ( context ) => context.store.dispatch( hideSidebar() );

const getPlanSlugFromFlowType = ( type, interval = 'yearly' ) => {
	const planSlugs = {
		yearly: {
			jetpack_search: PRODUCT_JETPACK_SEARCH,
		},
		monthly: {
			jetpack_search: PRODUCT_JETPACK_SEARCH_MONTHLY,
		},
	};

	return get( planSlugs, [ interval, type ], '' );
};

export function persistMobileAppFlow( context, next ) {
	const { query } = context;
	if ( config.isEnabled( 'jetpack/connect/mobile-app-flow' ) ) {
		if (
			some( MOBILE_APP_REDIRECT_URL_WHITELIST, ( pattern ) =>
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

	removeSidebar( context );

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
