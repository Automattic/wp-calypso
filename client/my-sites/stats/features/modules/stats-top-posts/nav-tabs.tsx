import page from '@automattic/calypso-router';
import { TabPanel } from '@wordpress/components';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
	getPathWithUpdatedQueryString,
	trackStatsAnalyticsEvent,
} from 'calypso/my-sites/stats/utils';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import useOptionLabels, {
	MAIN_STAT_TYPE,
	StatsModulePostsProps,
	getValidQueryViewType,
} from './use-option-labels';

function NavTabs( { query }: StatsModulePostsProps ) {
	const siteId = useSelector( getSelectedSiteId );
	const { supportsArchiveStats } = useSelector( ( state: object ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);

	const optionLabels = useOptionLabels();
	const tabPanelTabs = useMemo( () => {
		return Object.entries( optionLabels ).map( ( [ key, item ] ) => {
			return {
				name: key,
				title: item.tabLabel,
				className: `stats-navigation__${ key }`,
				path: getPathWithUpdatedQueryString( {
					viewType: key,
				} ),
				analyticsId: item.analyticsId,
			};
		} );
	}, [ optionLabels ] );

	const selectedTab =
		getValidQueryViewType( query.viewType, supportsArchiveStats ) || MAIN_STAT_TYPE;

	return (
		<TabPanel
			className="stats-navigation__tabs"
			tabs={ tabPanelTabs }
			initialTabName={ selectedTab }
			onSelect={ ( tabName ) => {
				const tab = tabPanelTabs.find( ( tab ) => tab.name === tabName );
				if ( tab?.path ) {
					trackStatsAnalyticsEvent( 'stats_posts_module_menu_clicked', {
						stat_type: tab.analyticsId,
					} );

					page( tab.path );
				}
			} }
		>
			{ () => null /* Placeholder div since content is rendered elsewhere */ }
		</TabPanel>
	);
}

export default NavTabs;
