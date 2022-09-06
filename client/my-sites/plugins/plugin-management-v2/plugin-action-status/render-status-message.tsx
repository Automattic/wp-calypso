import classNames from 'classnames';
import { ReactElement } from 'react';
import { CurrentSiteStatus, PluginActionStatus } from '../types';
import { getPluginActionStatusMessages } from '../utils/get-plugin-action-status-messages';
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
}: Props ): ReactElement | null {
	const currentGroupStatuses = groupedStatues[ currentStatus ];
	const currentStatusAction = currentGroupStatuses[ 0 ].action;

	const statusMessages = getPluginActionStatusMessages(
		currentGroupStatuses.length,
		hasOneStatus,
		selectedSite
	);

	const currentStatusMessage = statusMessages?.[ currentStatusAction ]?.[ currentStatus ];

	return currentStatusMessage ? (
		<span
			className={ classNames( 'plugin-action-status', `plugin-action-status-${ currentStatus }` ) }
		>
			{ currentStatusMessage }
		</span>
	) : null;
}
