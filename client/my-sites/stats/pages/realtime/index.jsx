import config from '@automattic/calypso-config';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import StatsNavigation from 'calypso/blocks/stats-navigation';
import { navItems } from 'calypso/blocks/stats-navigation/constants';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import StatsModuleTopPosts from 'calypso/my-sites/stats/features/modules/stats-top-posts';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import AnnualHighlightsSection from '../../sections/annual-highlights-section';
import PageViewTracker from '../../stats-page-view-tracker';
import statsStrings from '../../stats-strings';

const StatsRealtime = ( props ) => {
	const { query, siteId, siteSlug, isOdysseyStats, isJetpack } = props;
	const translate = useTranslate();
	const moduleStrings = statsStrings();

	const statsModuleListClass = clsx(
		'stats__module-list--insights',
		'stats__module--unified',
		'stats__module-list',
		'stats__flexible-grid-container',
		{
			'is-odyssey-stats': isOdysseyStats,
			'is-jetpack': isJetpack,
		}
	);

	const halfWidthModuleClasses = clsx(
		'stats__flexible-grid-item--half',
		'stats__flexible-grid-item--full--large',
		'stats__flexible-grid-item--full--medium'
	);

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
				<div className={ statsModuleListClass }>
					<StatsModuleTopPosts
						moduleStrings={ moduleStrings.posts }
						period={ props.period }
						query={ query }
						summaryUrl="https://example.com/" // { getStatHref( 'posts', query ) }
						className={ halfWidthModuleClasses }
					/>
				</div>
				<JetpackColophon />
			</div>
		</Main>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

const connectComponent = connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	return {
		siteId,
		siteSlug: getSelectedSiteSlug( state, siteId ),
		isOdysseyStats,
		isJetpack: isJetpackSite( state, siteId ),
	};
} );

export default connectComponent( StatsRealtime );
