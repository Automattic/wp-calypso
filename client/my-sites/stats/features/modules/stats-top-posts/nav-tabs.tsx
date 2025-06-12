import page from '@automattic/calypso-router';
import { TabPanel } from '@wordpress/components';
import { useMemo } from 'react';
import {
	getPathWithUpdatedQueryString,
	trackStatsAnalyticsEvent,
} from 'calypso/my-sites/stats/utils';
import useOptionLabels, { MAIN_STAT_TYPE, StatsModulePostsProps } from './use-option-labels';

function NavTabs( { query }: StatsModulePostsProps ) {
	const optionLabels = useOptionLabels();
	const tabPanelTabs = useMemo( () => {
		return Object.entries( optionLabels ).map( ( [ key, item ] ) => {
			return {
				name: key,
				title: item.tabLabel,
				className: `stats-navigation__${ key }`,
				path: getPathWithUpdatedQueryString( {
					viewdType: key,
				} ),
				analyticsId: item.analyticsId,
			};
		} );
	}, [ optionLabels ] );

	const selectedTab = query.viewdType || MAIN_STAT_TYPE;

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
