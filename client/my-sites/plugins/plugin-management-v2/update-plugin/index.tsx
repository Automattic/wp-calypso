import { Button } from '@automattic/components';
import { Icon, arrowRight } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { UPDATE_PLUGIN } from 'calypso/lib/plugins/constants';
import { useSelector } from 'calypso/state';
import { PluginActions } from '../../hooks/types';
import useShowPluginActionDialog from '../../hooks/use-show-plugin-action-dialog';
import usePluginVersionInfo from '../hooks/use-plugin-version-info';
import PluginActionStatus from '../plugin-action-status';
import { getAllowedPluginActions } from '../utils/get-allowed-plugin-actions';
import { getPluginActionStatuses } from '../utils/get-plugin-action-statuses';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	plugin: PluginComponentProps;
	selectedSite?: SiteDetails;
	className?: string;
	updatePlugin?: ( plugin: PluginComponentProps ) => void;
	siteCount?: number;
}

export default function UpdatePlugin( { plugin, selectedSite, className, updatePlugin }: Props ) {
	const translate = useTranslate();
	const state = useSelector( ( state ) => state );
	const showPluginActionDialog = useShowPluginActionDialog();

	const onShowUpdateConfirmationModal = useCallback( () => {
		if ( selectedSite ) {
			showPluginActionDialog( PluginActions.UPDATE, [ plugin ], [ selectedSite ], ( accepted ) => {
				if ( accepted ) {
					updatePlugin?.( plugin );
				}
			} );
		}
	}, [ plugin, selectedSite, updatePlugin, showPluginActionDialog ] );

	const { currentVersionsRange, updatedVersions, hasUpdate } = usePluginVersionInfo(
		plugin,
		selectedSite?.ID
	);

	const allowedActions = getAllowedPluginActions( plugin, state, selectedSite );

	let content;

	const allStatuses = getPluginActionStatuses( state );

	const updateStatuses = allStatuses.filter(
		( status ) =>
			status.pluginId === plugin.id &&
			status.action === UPDATE_PLUGIN &&
			// Filter out status based on selected site if any
			( selectedSite ? parseInt( status.siteId ) === selectedSite.ID : true )
	);

	const onUpdatePlugin = useCallback( () => {
		updatePlugin && updatePlugin( plugin );
	}, [ plugin, updatePlugin ] );

	if ( ! allowedActions?.autoupdate ) {
		content = <div>{ translate( 'Auto-managed on this site' ) }</div>;
	} else if ( updateStatuses.length > 0 ) {
		content = (
			<div className="update-plugin__plugin-action-status">
				<PluginActionStatus
					showMultipleStatuses={ false }
					currentSiteStatuses={ updateStatuses }
					selectedSite={ selectedSite }
					retryButton={
						<Button
							onClick={ onUpdatePlugin }
							className="update-plugin__retry-button"
							borderless
							compact
						>
							{ translate( 'Retry' ) }
						</Button>
					}
				/>
			</div>
		);
	} else if ( hasUpdate ) {
		content = (
			<div className="update-plugin__plugin-update-wrapper">
				<span className="update-plugin__current-version">
					{ currentVersionsRange?.min }
					{ currentVersionsRange?.max && ` - ${ currentVersionsRange.max }` }
				</span>
				<span className="update-plugin__arrow-icon">
					<Icon size={ 24 } icon={ arrowRight } />
				</span>
				<Button
					primary
					onClick={ onShowUpdateConfirmationModal }
					className="update-plugin__new-version"
					compact
				>
					{ translate( '{{span}}Update to {{/span}}%s', {
						components: {
							span: <span />,
						},
						args: updatedVersions[ 0 ],
					} ) }
				</Button>
			</div>
		);
	}

	return content ? <div className={ clsx( className ) }>{ content }</div> : null;
}
