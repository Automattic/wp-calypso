/** @format */
/**
 * External dependencies
 */
import { moment, translate } from 'i18n-calypso';
import { includes } from 'lodash';
import page from 'page';
import React from 'react';
import titlecase from 'to-title-case';

/**
 * Internal dependencies
 */
import { getQueryDate } from './utils';
import AsyncLoad from 'components/async-load';
import analytics from 'lib/analytics';
import { renderWithReduxStore } from 'lib/react-helpers';
import StatsPagePlaceholder from 'my-sites/stats/stats-page-placeholder';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';

function isValidParameters( context ) {
	const validParameters = {
		type: [ 'orders', 'products', 'categories', 'coupons' ],
		unit: [ 'day', 'week', 'month', 'year' ],
	};
	return Object.keys( validParameters ).every( param =>
		includes( validParameters[ param ], context.params[ param ] )
	);
}

export default function StatsController( context ) {
	if ( ! context.params.site || context.params.site === 'null' ) {
		page.redirect( '/stats/day/' );
	}
	if ( ! isValidParameters( context ) ) {
		page.redirect( `/store/stats/orders/day/${ context.params.site }` );
	}

	analytics.pageView.record(
		`/store/stats/${ context.params.type }/${ context.params.unit }`,
		`Store > Stats > ${ titlecase( context.params.type ) } > ${ titlecase( context.params.unit ) }`
	);

	const props = {
		querystring: context.querystring,
		type: context.params.type,
		unit: context.params.unit,
		path: context.pathname,
		queryDate: getQueryDate( context ),
		selectedDate: context.query.startDate || moment().format( 'YYYY-MM-DD' ),
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
	}
	if ( tracksEvent ) {
		analytics.tracks.recordEvent( tracksEvent, {
			unit: props.unit,
			query_date: props.queryDate,
			selected_date: props.selectedDate,
		} );
	}

	const asyncComponent =
		props.type === 'orders' ? (
			<AsyncLoad
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				placeholder={ <StatsPagePlaceholder className="woocommerce" /> }
				/* eslint-enable wpcalypso/jsx-classname-namespace */
				require="extensions/woocommerce/app/store-stats"
				{ ...props }
			/>
		) : (
			<AsyncLoad
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				placeholder={ <StatsPagePlaceholder className="woocommerce" /> }
				/* eslint-enable wpcalypso/jsx-classname-namespace */
				require="extensions/woocommerce/app/store-stats/listview"
				{ ...props }
			/>
		);
	renderWithReduxStore( asyncComponent, document.getElementById( 'primary' ), context.store );
}
