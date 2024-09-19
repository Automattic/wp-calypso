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
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import renderHeaderSection from '../lib/header-section';
import { getSelectedTabTitle, DEFAULT_TAB } from './helper';

const ANALYTICS_PAGE_TITLE = 'Reader';

const exported = {
	discover( context, next ) {
		const basePath = sectionify( context.path );
		const fullAnalyticsPageTitle = ANALYTICS_PAGE_TITLE + ' > Discover';
		const streamKey = 'discover:recommended';
		const mcKey = 'discover';
		const state = context.store.getState();

		const currentRoute = getCurrentRoute( state );
		const currentQueryArgs = new URLSearchParams( getCurrentQueryArguments( state ) ).toString();

		trackPageLoad( basePath, fullAnalyticsPageTitle, mcKey );
		recordTrack(
			'calypso_reader_discover_viewed',
			{},
			{ pathnameOverride: `${ currentRoute }?${ currentQueryArgs }` }
		);

		if ( ! isUserLoggedIn( state ) ) {
			context.renderHeaderSection = renderHeaderSection;
		}
		const selectedTab = context.query.selectedTab || DEFAULT_TAB;
		const tabTitle = getSelectedTabTitle( selectedTab ) || '';
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		context.primary = (
			<>
				<DocumentHead
					title={ translate( 'Browse %s blogs & read articles ‹ Reader', {
						args: [ tabTitle ],
						comment: '%s is the type of blog being explored e.g. food, art, technology etc.',
					} ) }
				/>
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
					suppressSiteNameLink
					isDiscoverStream
					useCompactCards
					showBack={ false }
					className="is-discover-stream"
					selectedTab={ selectedTab }
				/>
			</>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
		next();
	},
};

export default exported;

export const { discover } = exported;
