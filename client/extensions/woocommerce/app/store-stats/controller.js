/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { includes } from 'lodash';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import AsyncLoad from 'components/async-load';
import StatsPagePlaceholder from 'my-sites/stats/stats-page-placeholder';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { getQueryDate } from './utils';
import analytics from 'lib/analytics';
import titlecase from 'to-title-case';

function isValidParameters( context ) {
	const validParameters = {
		type: [ 'orders', 'products', 'categories', 'coupons' ],
		unit: [ 'day', 'week', 'month', 'year' ],
	};
	return Object.keys( validParameters )
		.every( param => includes( validParameters[ param ], context.params[ param ] ) );
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

	analytics.tracks.recordEvent( `calypso_woocommerce_stats_${ props.type }_page`, props );

	const asyncComponent = ( props.type === 'orders' )
		? <AsyncLoad
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			placeholder={ <StatsPagePlaceholder className="woocommerce" /> }
			/* eslint-enable wpcalypso/jsx-classname-namespace */
			require="extensions/woocommerce/app/store-stats"
			{ ...props }
		/>
		: <AsyncLoad
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			placeholder={ <StatsPagePlaceholder className="woocommerce" /> }
			/* eslint-enable wpcalypso/jsx-classname-namespace */
			require="extensions/woocommerce/app/store-stats/listview"
			{ ...props }
		/>;
	renderWithReduxStore(
		asyncComponent,
		document.getElementById( 'primary' ),
		context.store
	);
}
