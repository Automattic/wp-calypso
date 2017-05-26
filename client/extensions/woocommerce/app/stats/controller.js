/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import AsyncLoad from 'components/async-load';
import StatsPagePlaceholder from 'my-sites/stats/stats-page-placeholder';

function isValidParameters( context ) {
	const validParameters = {
		type: [ 'orders' ],
		unit: [ 'day', 'week', 'month', 'year' ],
	};
	return Object.keys( validParameters )
		.every( param => includes( validParameters[ param ], context.params[ param ] ) );
}

export default function StatsController( context ) {
	if ( ! isValidParameters( context ) ) {
		page.redirect( `/store/stats/orders/day/${ context.params.site }` );
	}

	const props = {
		type: context.params.type,
		unit: context.params.unit,
		startDate: context.query.start_date,
	};
	renderWithReduxStore(
		<AsyncLoad
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			placeholder={ <StatsPagePlaceholder className="woocommerce" /> }
			/* eslint-enable wpcalypso/jsx-classname-namespace */
			require="extensions/woocommerce/app/stats"
			{ ...props }
		/>,
		document.getElementById( 'primary' ),
		context.store
	);
}
