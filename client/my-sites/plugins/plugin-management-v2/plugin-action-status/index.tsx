import { ReactElement } from 'react';
import { PLUGIN_INSTALLATION_IN_PROGRESS } from 'calypso/state/plugins/installed/status/constants';
import { CurrentSiteStatus } from '../types';
import RenderStatusMessage from './render-status-message';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	currentSiteStatuses: Array< CurrentSiteStatus | any >;
	selectedSite?: SiteDetails;
}

export default function PluginActionStatus( {
	currentSiteStatuses,
	selectedSite,
}: Props ): ReactElement | null {
	// Group statuses by status type(completed, error, inProgress)
	const groupedStatues = currentSiteStatuses.reduce( ( group, plugin ) => {
		const { status } = plugin;
		group[ status ] = group[ status ] ?? [];
		group[ status ].push( plugin );
		return group;
	}, {} );

	const groupedStatusKeys = Object.keys( groupedStatues );

	let filteredStatuses = groupedStatusKeys;

	// Filter only inProgress statuses if there is any in-progress action.
	if ( groupedStatusKeys.includes( PLUGIN_INSTALLATION_IN_PROGRESS ) ) {
		filteredStatuses = groupedStatusKeys.filter(
			( status ) => status === PLUGIN_INSTALLATION_IN_PROGRESS
		);
	}

	const hasOneStatus = filteredStatuses.length === 1;

	return (
		<div className="plugin-action-status-container">
			{ filteredStatuses.map( ( groupKey: any ) => (
				<RenderStatusMessage
					key={ groupKey }
					currentStatus={ groupKey }
					selectedSite={ selectedSite }
					groupedStatues={ groupedStatues }
					hasOneStatus={ hasOneStatus }
				/>
			) ) }
		</div>
	);
}
