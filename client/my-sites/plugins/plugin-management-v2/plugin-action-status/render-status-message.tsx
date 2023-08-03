import classNames from 'classnames';
import { CurrentSiteStatus, PluginActionStatus } from '../types';
import { getPluginActionStatusMessages } from './get-plugin-action-status-messages';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	selectedSite?: SiteDetails;
	currentStatus: PluginActionStatus;
	groupedStatues: { [ key in PluginActionStatus ]: Array< CurrentSiteStatus > };
	hasOneStatus: boolean;
}

export default function RenderStatusMessage( {
	selectedSite,
	currentStatus,
	groupedStatues,
	hasOneStatus,
}: Props ) {
	const currentGroupStatuses = groupedStatues[ currentStatus ];
	const currentStatusAction = currentGroupStatuses[ 0 ].action;

	const statusMessages = getPluginActionStatusMessages(
		currentGroupStatuses.length,
		hasOneStatus,
		selectedSite
	);

	const currentStatusMessage = statusMessages?.[ currentStatusAction ]?.[ currentStatus ];

	if ( ! currentStatusMessage ) {
		return null;
	}

	return (
		<span
			className={ classNames( 'plugin-action-status', `plugin-action-status-${ currentStatus }` ) }
		>
			{ currentStatusMessage }
		</span>
	);
}
