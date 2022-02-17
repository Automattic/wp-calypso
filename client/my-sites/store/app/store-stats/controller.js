import { translate } from 'i18n-calypso';
import { includes } from 'lodash';
import moment from 'moment';
import page from 'page';
import AsyncLoad from 'calypso/components/async-load';
import StatsPagePlaceholder from 'calypso/my-sites/stats/stats-page-placeholder';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import { recordTrack } from '../../lib/analytics';
import { getQueryDate } from './utils';

function isValidParameters( context ) {
	const validParameters = {
		type: [ 'orders', 'products', 'categories', 'coupons' ],
		unit: [ 'day', 'week', 'month', 'year' ],
	};
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
	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
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
					require="../../../store/app/store-stats"
					{ ...props }
				/>
			);
			break;
		default:
			asyncComponent = (
				<AsyncLoad
					placeholder={ placeholder }
					require="../../../store/app/store-stats/listview"
					{ ...props }
				/>
			);
			break;
	}

	context.primary = asyncComponent;
	next();
}
