import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import StatsModuleTopPosts from 'calypso/my-sites/stats/features/modules/stats-top-posts';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AnnualHighlightsSection from '../../sections/annual-highlights-section';
import PageViewTracker from '../../stats-page-view-tracker';
import statsStrings from '../../stats-strings';
import PageLoading from '../shared/page-loading';
import StatsModuleListing from '../shared/stats-module-listing';

import './style.scss';

function StatsRealtime() {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state, siteId ) );
	const translate = useTranslate();
	const moduleStrings = statsStrings();

	const halfWidthModuleClasses = clsx(
		'stats__flexible-grid-item--half',
		'stats__flexible-grid-item--full--large',
		'stats__flexible-grid-item--full--medium'
	);

	// TODO: Determine how query will be set up.
	// Need a period, a query, and a URL to use Top Posts.
	// See getStatHref() example on Traffic page for URL.
	const period = {};
	const query = {};
	const url = '#';

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	sessionStorage.setItem( 'jp-stats-last-tab', 'realtime' );

	// TODO: should be refactored into separate components
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/realtime/:site" title="Stats > Realtime" />
			<div className="stats">
				<NavigationHeader
					className="stats__section-header modernized-header"
					title={ translate( 'Jetpack Stats' ) }
					subtitle={ translate( "View your site's performance and learn from trends." ) }
					screenReader={ navItems.realtime?.label }
					navigationItems={ [] }
				></NavigationHeader>
				<StatsNavigation selectedItem="realtime" siteId={ siteId } slug={ siteSlug } />
				<AnnualHighlightsSection siteId={ siteId } />
				<AsyncLoad
					require="calypso/my-sites/stats/components/line-chart"
					height={ 425 }
					placeholder={ PageLoading }
				/>
				<StatsModuleListing className="stats__module-list--insights" siteId={ siteId }>
					<StatsModuleTopPosts
						moduleStrings={ moduleStrings.posts }
						period={ period }
						query={ query }
						summaryUrl={ url }
						className={ halfWidthModuleClasses }
					/>
				</StatsModuleListing>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default StatsRealtime;
