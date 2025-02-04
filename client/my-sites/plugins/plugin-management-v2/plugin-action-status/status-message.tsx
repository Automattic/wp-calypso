import clsx from 'clsx';
import useStatusMessageText from './use-status-message-text';
import type { CurrentSiteStatus, PluginActionStatus } from '../types';
import type { SiteDetails } from '@automattic/data-stores';
import './style.scss';

interface Props {
	selectedSite?: SiteDetails;
	currentStatus: PluginActionStatus;
	groupedStatues: { [ key in PluginActionStatus ]: Array< CurrentSiteStatus > };
	hasOneStatus: boolean;
}

export default function StatusMessage( {
	selectedSite,
	currentStatus,
	groupedStatues,
	hasOneStatus,
}: Props ) {
	const currentGroupStatuses = groupedStatues[ currentStatus ];
	const currentStatusAction = currentGroupStatuses[ 0 ].action;

	const message = useStatusMessageText( {
		action: currentStatusAction,
		status: currentStatus,
		hasSelectedSite: !! selectedSite,
		siteCount: currentGroupStatuses.length,
		hasOneStatus,
	} );

	if ( ! message ) {
		return null;
	}

	return (
		<span className={ clsx( 'plugin-action-status', `plugin-action-status-${ currentStatus }` ) }>
			{ message }
		</span>
	);
}
