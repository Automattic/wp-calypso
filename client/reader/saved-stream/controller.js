import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import { trackPageLoad } from 'calypso/reader/controller-helper';

const loadMain = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-saved-stream-main" */ 'calypso/reader/saved-stream/main'
	);

const analyticsPageTitle = 'Reader';

const exported = {
	saved( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = analyticsPageTitle + ' > Saved';
		const mcKey = 'saved';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );

		context.primary = <AsyncLoad require={ loadMain } key="saved" placeholder={ null } />;
		next();
	},
};

export default exported;

export const { saved } = exported;
