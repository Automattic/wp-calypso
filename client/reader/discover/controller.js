import AsyncLoad from 'calypso/components/async-load';
import { sectionify } from 'calypso/lib/route';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';

const ANALYTICS_PAGE_TITLE = 'Reader';

const exported = {
	discover( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Discover';
		const streamKey = `discover:`;
		const mcKey = 'discover';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_discover_viewed' );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		context.primary = (
			<AsyncLoad
				require="calypso/reader/discover/discover-stream"
				key="discover-page"
				streamKey={ streamKey }
				title="Discover"
				trackScrollPage={ trackScrollPage.bind(
					null,
					basePath,
					fullAnalyticsPageTitle,
					ANALYTICS_PAGE_TITLE,
					mcKey
				) }
				onUpdatesShown={ trackUpdatesLoaded.bind( null, mcKey ) }
				suppressSiteNameLink={ true }
				showPrimaryFollowButtonOnCards={ false }
				isDiscoverStream={ true }
				showBack={ false }
				className="is-discover-stream"
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
		next();
	},
};

export default exported;

export const { discover } = exported;
