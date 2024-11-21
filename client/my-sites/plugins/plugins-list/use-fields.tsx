import { Button } from '@wordpress/components';
import { Operator } from '@wordpress/dataviews';
import { Icon, plugins } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { useMemo } from 'react';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import { Plugin } from 'calypso/state/plugins/installed/types';
import { PluginActions } from '../hooks/types';
import PluginActionStatus from '../plugin-management-v2/plugin-action-status';

export function useFields(
	bulkActionDialog: ( action: string, plugins: Array< Plugin > ) => void,
	toggleDialogForPlugin: ( plugin: Plugin | null ) => void
) {
	const fields = useMemo(
		() => [
			{
				id: 'status',
				label: translate( 'Status' ),
				getValue: ( { item }: { item: Plugin } ) => {
					return item.status;
				},
				render: () => null,
				elements: [
					{
						value: PLUGINS_STATUS.ACTIVE,
						label: translate( 'Active' ),
					},
					{
						value: PLUGINS_STATUS.INACTIVE,
						label: translate( 'Inactive' ),
					},
					{
						value: PLUGINS_STATUS.UPDATE,
						label: translate( 'Needs update' ),
					},
				],
				filterBy: {
					operators: [ 'isAny' as Operator ],
					isPrimary: false,
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plugins',
				label: translate( 'Installed Plugins' ),
				getValue: ( { item }: { item: Plugin } ) => item.name,
				enableGlobalSearch: true,
				render: ( { item }: { item: Plugin } ) => {
					let pluginActionStatus = null;

					if ( item.allStatuses?.length ) {
						pluginActionStatus = (
							<Button
								className="sites-manage-plugin-status-button"
								onClick={ () => toggleDialogForPlugin( item ) }
							>
								<PluginActionStatus
									currentSiteStatuses={ item.allStatuses }
									selectedSite={ undefined }
								/>
							</Button>
						);
					}

					return (
						<>
							{ item.icon && <img className="plugin-icon" alt={ item.name } src={ item.icon } /> }
							{ ! item.icon && <Icon size={ 32 } icon={ plugins } className="plugin-icon" /> }
							<a href={ '/plugins/' + item.slug }>{ item.name }</a>
							{ pluginActionStatus }
						</>
					);
				},
				enableSorting: true,
			},
			{
				id: 'sites',
				label: translate( 'Sites' ),
				enableHiding: false,
				getValue: ( { item }: { item: Plugin } ) => {
					// Used exclusively for sorting
					return item.sites && Object.keys( item.sites ).length;
				},
				render: ( { item }: { item: Plugin } ) => {
					const numberOfSites = item.sites && Object.keys( item.sites ).length;
					return (
						<Button
							className="sites-manage-plugin-button"
							onClick={ () => toggleDialogForPlugin( item ) }
						>
							{ numberOfSites }
						</Button>
					);
				},
			},
			{
				id: 'update',
				label: translate( 'Update available' ),
				getValue: ( { item }: { item: Plugin } ) => {
					// Used exclusively for sorting
					return item.status?.includes( PLUGINS_STATUS.UPDATE ) ? 'a' : 'b';
				},
				enableHiding: false,
				render: ( { item }: { item: Plugin } ) => {
					if ( item.status?.includes( PLUGINS_STATUS.UPDATE ) && item?.update?.new_version ) {
						return (
							<Button
								variant="secondary"
								onClick={ () => bulkActionDialog( PluginActions.UPDATE, [ item ] ) }
							>
								{ translate( 'Update to version %(version)s', {
									args: {
										version: item?.update?.new_version
											? item.update.new_version.split( '-' ).slice( 0, 2 ).join( '-' )
											: '',
									},
								} ) }
							</Button>
						);
					}
				},
			},
		],
		[ bulkActionDialog, toggleDialogForPlugin ]
	);

	return fields;
}
