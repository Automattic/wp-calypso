import { connect } from 'react-redux';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import Main from 'calypso/components/main';
import { useRequestSiteChecklistTaskUpdate } from 'calypso/data/site-checklist';
import { CHECKLIST_KNOWN_TASKS } from 'calypso/state/data-layer/wpcom/checklist/index.js';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { getCurrentPlan, isRequestingSitePlans } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getActiveTheme } from 'calypso/state/themes/selectors';
import { connectOptions } from './theme-options';
import ThemeShowcase from './theme-showcase';

const ConnectedSingleSiteWpcom = connectOptions( ( props ) => {
	const { currentThemeId, siteId, siteSlug } = props;
	useRequestSiteChecklistTaskUpdate( siteId, CHECKLIST_KNOWN_TASKS.THEMES_BROWSED );

	return (
		<Main fullWidthLayout className="themes">
			{ siteId && <QueryActiveTheme siteId={ siteId } /> }
			{ siteId && currentThemeId && (
				<QueryCanonicalTheme themeId={ currentThemeId } siteId={ siteId } />
			) }

			<ThemeShowcase { ...props } upsellUrl={ `/plans/${ siteSlug }` } siteId={ siteId } />
		</Main>
	);
} );

export default connect( ( state, { siteId } ) => ( {
	isVip: isVipSite( state, siteId ),
	siteSlug: getSiteSlug( state, siteId ),
	requestingSitePlans: isRequestingSitePlans( state, siteId ),
	currentPlan: getCurrentPlan( state, siteId ),
	currentThemeId: getActiveTheme( state, siteId ),
} ) )( ConnectedSingleSiteWpcom );
