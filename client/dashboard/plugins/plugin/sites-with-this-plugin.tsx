import { Site } from '@automattic/api-core';
import { sitePluginActivateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { DataViews, filterSortAndPaginate, View } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { buildBulkSitesPluginAction } from '../manage/utils';
import { usePlugin } from './use-plugin';

const defaultView: View = {
	type: 'table',
	fields: [ 'active', 'autoupdate', 'update' ],
	sort: { field: 'name', direction: 'asc' },
	titleField: 'domain',
};

const ActionRenderModal = ( { actionId, item, closeModal, onExecute, pluginId } ) => {
	const [ isBusy, setIsBusy ] = useState( false );

	const handleConfirm = async () => {
		setIsBusy( true );
		try {
			const { successCount, errorCount } = await onExecute( [
				{ id: pluginId, siteIds: [ item.ID ] },
			] );

			console.debug( 'successCount', successCount );
			console.debug( 'errorCount', errorCount );
			// if ( successCount > 0 ) {
			// 	const prefix = buildSuccessPrefix( actionId, items );
			// 	createSuccessNotice(
			// 		sprintf(
			// 			// translators: %d is the number of sites.
			// 			_n( '%1$s on %2$d site', '%1$s on %2$d sites', successCount, 'next-admin' ),
			// 			prefix,
			// 			successCount
			// 		),
			// 		{
			// 			type: 'snackbar',
			// 		}
			// 	);
			// }
			// if ( errorCount > 0 ) {
			// 	const errorPrefix = buildErrorPrefix( actionId, items );
			// 	createErrorNotice(
			// 		sprintf(
			// 			// translators: %d is the number of sites.
			// 			_n( '%1$s on %2$d site', '%1$s on %2$d sites', errorCount, 'next-admin' ),
			// 			errorPrefix,
			// 			errorCount
			// 		),
			// 		{
			// 			type: 'snackbar',
			// 		}
			// 	);
			// }
		} finally {
			setIsBusy( false );
			closeModal?.();
		}
	};

	return (
		<VStack spacing={ 4 }>
			<Text>
				{ sprintf(
					// translators: %1$s is the plugin name. %2$d is the number of sites.
					__( 'You are about to activate the %1$s plugin installed on %2$d sites.' ),
					'foo',
					1
				) }
			</Text>
			<HStack justify="right">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ closeModal }
					disabled={ isBusy }
					accessibleWhenDisabled
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					onClick={ handleConfirm }
					isBusy={ isBusy }
					disabled={ isBusy }
					accessibleWhenDisabled
				>
					{ __( 'Activate' ) }
				</Button>
			</HStack>
		</VStack>
	);
};

export const SitesWithThisPlugin = ( { pluginSlug }: { pluginSlug: string } ) => {
	const [ view, setView ] = useState< View >( defaultView );
	const { isLoading, pluginBySiteId, sitesWithThisPlugin } = usePlugin( pluginSlug );

	const fields = useMemo(
		() => [
			{
				id: 'domain',
				label: __( 'Site' ),
				getValue: ( { item }: { item: Site } ) => item.URL,
				render: ( { item }: { item: Site } ) => item.URL,
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'active',
				label: __( 'Active' ),
				getValue: ( { item }: { item: Site } ) => pluginBySiteId.get( item.ID )?.active ?? false,
				render: ( { item }: { item: Site } ) => pluginBySiteId.get( item.ID )?.active ?? false,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'autoupdate',
				label: __( 'Autoupdate' ),
				getValue: ( { item }: { item: Site } ) =>
					pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				render: ( { item }: { item: Site } ) => pluginBySiteId.get( item.ID )?.autoupdate ?? false,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'update',
				label: __( 'Update' ),
				render: () => 'Update',
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ pluginBySiteId ]
	);

	const { data, paginationInfo } = filterSortAndPaginate( sitesWithThisPlugin, view, fields );

	return (
		<DataViews
			isLoading={ isLoading }
			data={ data }
			fields={ fields }
			view={ view }
			onChangeView={ setView }
			defaultLayouts={ { table: {} } }
			actions={ [
				{
					id: 'activate',
					label: __( 'Activate' ),
					modalHeader: __( 'Activate plugin' ),
					RenderModal: ( { items, closeModal } ) => {
						const [ item ] = items;
						console.debug( 'item', item );
						const { mutateAsync } = useMutation( sitePluginActivateMutation() );
						const action = buildBulkSitesPluginAction( mutateAsync );
						return (
							<ActionRenderModal
								actionId="activate"
								item={ item }
								closeModal={ closeModal }
								onExecute={ action }
								pluginId={ pluginId }
							/>
						);
					},
					isEligible: ( item ) => ! item.isActive,
					supportsBulk: true,
				},
				{
					id: 'delete',
					label: __( 'Delete' ),
					isPrimary: false,
					callback: ( items ) => {
						// Dummy delete action for now
						// eslint-disable-next-line no-console
						console.log( 'Delete clicked for plugin', items[ 0 ] );
					},
				},
			] }
			getItemId={ ( item ) => String( item.ID ) }
			paginationInfo={ paginationInfo }
		/>
	);
};
