import { find } from 'lodash';
import moment from 'moment';
import AsyncLoad from 'calypso/components/async-load';
import { getSiteFilters, rangeOfPeriod, type SiteFilterType } from '../shared/helpers';
import PageLoading from '../shared/page-loading';
import type { Context } from '@automattic/calypso-router';

setTimeout( () => import( 'calypso/my-sites/stats/pages/subscribers' ), 3000 );

function subscribers( context: Context, next: () => void ) {
	const givenSiteId = context.params.site;
	const filters = getSiteFilters( givenSiteId );
	const activeFilter = find( filters, ( filter: SiteFilterType ) => {
		return (
			context.path.indexOf( filter.path ) >= 0 ||
			( filter.altPaths && context.path.indexOf( filter.altPaths ) >= 0 )
		);
	} ) as SiteFilterType;

	// moment and rangeOfPeriod format needed for summary page link for email mdule
	const date = moment().locale( 'en' );

	context.primary = (
		<AsyncLoad
			require="calypso/my-sites/stats/pages/subscribers"
			placeholder={ PageLoading }
			period={ rangeOfPeriod( activeFilter?.period || 'day', date ) }
			context={ context }
		/>
	);
	next();
}

export default subscribers;
