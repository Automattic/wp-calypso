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
	const groupedStatues = currentSiteStatuses.reduce( ( group, plugin ) => {
		const { status } = plugin;
		group[ status ] = group[ status ] ?? [];
		group[ status ].push( plugin );
		return group;
	}, {} );

	const groupedStatusKeys = Object.keys( groupedStatues );

	const filteredStatuses = groupedStatusKeys.filter( ( status ) =>
		groupedStatusKeys.includes( PLUGIN_INSTALLATION_IN_PROGRESS )
			? status === PLUGIN_INSTALLATION_IN_PROGRESS
			: true
	);

	const hasOneStatus = filteredStatuses.length === 1;

	return (
		<div className="plugin-action-status-container">
			{ filteredStatuses.map( ( groupKey: any ) => (
				<RenderStatusMessage
					key={ groupKey }
					groupKey={ groupKey }
					selectedSite={ selectedSite }
					groupedStatues={ groupedStatues }
					hasOneStatus={ hasOneStatus }
				/>
			) ) }
		</div>
	);
}
