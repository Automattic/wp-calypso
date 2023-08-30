import { translate } from 'i18n-calypso';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import { sectionify } from 'calypso/lib/route';
import {
	trackPageLoad,
	trackUpdatesLoaded,
	trackScrollPage,
} from 'calypso/reader/controller-helper';
import { recordTrack } from 'calypso/reader/stats';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import renderHeaderSection from '../lib/header-section';

const ANALYTICS_PAGE_TITLE = 'Reader';

const exported = {
	discover( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Discover';
		const streamKey = 'discover:recommended';
		const mcKey = 'discover';

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack( 'calypso_reader_discover_viewed' );

		if ( ! isUserLoggedIn( context.store.getState() ) ) {
			context.renderHeaderSection = renderHeaderSection;
		}
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		context.primary = (
			<>
				<DocumentHead title={ translate( 'Browse Popular Blogs & Read Articles ‹ Reader' ) } />
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
					isDiscoverStream={ true }
					useCompactCards={ true }
					showBack={ false }
					className="is-discover-stream"
				/>
			</>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
		next();
	},
};

export default exported;

export const { discover } = exported;
