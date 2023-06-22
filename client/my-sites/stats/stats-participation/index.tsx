// import config from '@automattic/calypso-config';
// import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackColophon from 'calypso/components/jetpack-colophon';
import Main from 'calypso/components/main';
// import { getSuggestionsVendor } from 'calypso/lib/domains/suggestions';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from '../stats-page-view-tracker';
import StatsParticipationWizard from './stats-participation-wizard';

// interface StatsParticipationPageProps {}

const StatsParticipationPage = () => {
	const translate = useTranslate();
	// Use hooks for Redux pulls.
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	// const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	// Run-time configuration.
	// const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	// const isChartVisible = config.isEnabled( 'stats/subscribers-chart-section' );

	// const today = new Date().toISOString().slice( 0, 10 );

	// const statsModuleListClass = classNames(
	// 	'stats__module-list stats__module--unified',
	// 	{
	// 		'is-odyssey-stats': isOdysseyStats,
	// 		'is-jetpack': isJetpack,
	// 	},
	// 	'subscribers-page'
	// );

	// Track the last viewed tab.
	// Necessary to properly configure the fixed navigation headers.
	// sessionStorage.setItem( 'jp-stats-last-tab', 'subscribers' );

	return (
		<Main fullWidthLayout>
			<DocumentHead title={ translate( 'Jetpack Stats' ) } />
			<PageViewTracker path="/stats/participation/:site" title="Stats > Participation" />
			<div className="stats">
				<StatsParticipationWizard site={ siteSlug } />
				<JetpackColophon />
			</div>
		</Main>
	);
};

export default StatsParticipationPage;
