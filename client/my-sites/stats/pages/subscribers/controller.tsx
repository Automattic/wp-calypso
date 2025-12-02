import { find } from 'lodash';
import AsyncLoad from 'calypso/components/async-load';
import { getMomentSiteZone } from '../../hooks/use-moment-site-zone';
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
	const momentSiteZone = getMomentSiteZone( context.store.getState(), givenSiteId );
	const date = momentSiteZone().locale( 'en' );

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
