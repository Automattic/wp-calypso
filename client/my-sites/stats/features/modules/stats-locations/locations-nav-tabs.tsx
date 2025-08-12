import page from '@automattic/calypso-router';
import { TabPanel } from '@wordpress/components';
import { useMemo } from 'react';
import {
	getPathWithUpdatedQueryString,
	trackStatsAnalyticsEvent,
} from 'calypso/my-sites/stats/utils';
import { StatsQueryType } from '../types';
import { UrlGeoMode, OPTION_KEYS } from './types';
import useOptionLabels from './use-option-labels';

function LocationsNavTabs( { query }: { query: StatsQueryType & { geoMode?: UrlGeoMode } } ) {
	const optionLabels = useOptionLabels();
	const tabPanelTabs = useMemo( () => {
		return Object.entries( optionLabels ).map( ( [ key, item ] ) => {
			return {
				name: key,
				title: item.selectLabel,
				className: `stats-navigation__${ key }`,
				path: getPathWithUpdatedQueryString( {
					geoMode: key,
				} ),
				feature: item.feature,
			};
		} );
	}, [ optionLabels ] );

	const selectedTab = query.geoMode || OPTION_KEYS.COUNTRIES;

	return (
		<TabPanel
			className="stats-navigation__tabs"
			tabs={ tabPanelTabs }
			initialTabName={ selectedTab }
			onSelect={ ( tabName ) => {
				const tab = tabPanelTabs.find( ( tab ) => tab.name === tabName );
				if ( tab?.path ) {
					trackStatsAnalyticsEvent( 'stats_locations_module_menu_clicked', {
						stat_type: tab.feature,
					} );
					page( tab.path );
				}
			} }
		>
			{ () => null /* Placeholder div since content is rendered elsewhere */ }
		</TabPanel>
	);
}

export default LocationsNavTabs;
