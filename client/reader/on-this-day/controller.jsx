import i18n from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { recordTrack } from 'calypso/reader/stats';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { trackPageLoad, setPageTitle } from '../controller-helper';

const analyticsPageTitle = 'Reader';

export function onThisDay( context, next ) {
	const basePath = sectionify( context.path );
	const fullAnalyticsPageTitle = analyticsPageTitle + ' > On This Day';
	const mcKey = 'on-this-day';

	trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

	const state = context.store.getState();
	recordTrack(
		'calypso_reader_on_this_day_loaded',
		{},
		{ pathnameOverride: getCurrentRoute( state ) }
	);

	setPageTitle( context, i18n.translate( 'On This Day' ) );

	context.primary = <AsyncLoad require="calypso/reader/on-this-day/main" />;
	next();
}
