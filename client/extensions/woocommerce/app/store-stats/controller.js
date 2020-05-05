/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { includes } from 'lodash';
import { translate } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import StatsPagePlaceholder from 'my-sites/stats/stats-page-placeholder';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { getQueryDate, getQueries } from './utils';
import { recordTrack } from 'woocommerce/lib/analytics';
import config from 'config';

function isValidParameters( context ) {
	const validParameters = {
		type: [ 'orders', 'products', 'categories', 'coupons' ],
		unit: [ 'day', 'week', 'month', 'year' ],
	};
	if ( config.isEnabled( 'woocommerce/extension-referrers' ) ) {
		validParameters.type.push( 'referrers' );
	}
	return Object.keys( validParameters ).every( ( param ) =>
		includes( validParameters[ param ], context.params[ param ] )
	);
}

export default function StatsController( context, next ) {
	if ( ! context.params.site || context.params.site === 'null' ) {
		page.redirect( '/stats/day/' );
	}
	if ( ! isValidParameters( context ) ) {
		page.redirect( `/store/stats/orders/day/${ context.params.site }` );
	}

	const props = {
		type: context.params.type,
		unit: context.params.unit,
		path: context.pathname,
		queryDate: getQueryDate( context ),
		selectedDate: context.query.startDate || moment().format( 'YYYY-MM-DD' ),
		queryParams: context.query || {},
	};
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( translate( 'Stats', { textOnly: true } ) ) );

	let tracksEvent;
	switch ( props.type ) {
		case 'orders':
			tracksEvent = 'calypso_woocommerce_stats_orders_page';
			break;
		case 'products':
			tracksEvent = 'calypso_woocommerce_stats_products_page';
			break;
		case 'categories':
			tracksEvent = 'calypso_woocommerce_stats_categories_page';
			break;
		case 'coupons':
			tracksEvent = 'calypso_woocommerce_stats_coupons_page';
			break;
		case 'referrers':
			tracksEvent = 'calypso_woocommerce_stats_referrers_page';
			break;
	}
	if ( tracksEvent ) {
		recordTrack( tracksEvent, {
			unit: props.unit,
			query_date: props.queryDate,
			selected_date: props.selectedDate,
		} );
	}

	let asyncComponent;
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	const placeholder = <StatsPagePlaceholder className="woocommerce" />;
	/* eslint-enable wpcalypso/jsx-classname-namespace */

	switch ( props.type ) {
		case 'orders':
			asyncComponent = (
				<AsyncLoad
					placeholder={ placeholder }
					require="extensions/woocommerce/app/store-stats"
					{ ...props }
				/>
			);
			break;
		case 'referrers': {
			const { referrerQuery } = getQueries( props.unit, props.queryDate );
			asyncComponent = (
				<AsyncLoad
					placeholder={ placeholder }
					require="extensions/woocommerce/app/store-stats/referrers"
					query={ referrerQuery }
					{ ...props }
				/>
			);
			break;
		}
		default:
			asyncComponent = (
				<AsyncLoad
					placeholder={ placeholder }
					require="extensions/woocommerce/app/store-stats/listview"
					{ ...props }
				/>
			);
			break;
	}

	context.primary = asyncComponent;
	next();
}
