import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ButtonGroup from 'calypso/components/button-group';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { resetPluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import PluginsList from './plugins-list';
import type { Plugin } from './types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	plugins: Array< Plugin >;
	isLoading: boolean;
	selectedSite: SiteDetails;
	searchTerm: string;
	isBulkManagementActive: boolean;
	pluginUpdateCount: number;
	toggleBulkManagement: () => void;
	updateAllPluginsNotice: () => void;
	removePluginNotice: ( plugin: Plugin ) => void;
	updatePlugin: ( plugin: Plugin ) => void;
}
export default function PluginManagementV2( {
	plugins,
	isLoading,
	selectedSite,
	searchTerm,
	isBulkManagementActive,
	pluginUpdateCount,
	toggleBulkManagement,
	updateAllPluginsNotice,
	removePluginNotice,
	updatePlugin,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	useEffect( () => {
		return () => {
			dispatch( resetPluginStatuses() );
		};
	}, [ dispatch ] );

	const renderBulkActionsHeader = () => {
		if ( isLoading ) {
			return <TextPlaceholder />;
		}

		return (
			<div className="plugin-common-table__bulk-actions">
				{ !! pluginUpdateCount && (
					<ButtonGroup className="plugin-management-v2__table-button-group">
						<Button compact primary onClick={ updateAllPluginsNotice }>
							{ translate( 'Update %(numUpdates)d Plugin', 'Update %(numUpdates)d Plugins', {
								context: 'button label',
								count: pluginUpdateCount,
								args: {
									numUpdates: pluginUpdateCount,
								},
							} ) }
						</Button>
					</ButtonGroup>
				) }
				<ButtonGroup className="plugin-management-v2__table-button-group">
					<Button compact onClick={ toggleBulkManagement }>
						{ translate( 'Edit All', { context: 'button label' } ) }
					</Button>
				</ButtonGroup>
			</div>
		);
	};

	const columns = [
		{
			key: 'plugin',
			header: translate( 'Installed Plugins' ),
		},
		...( selectedSite
			? [
					{
						key: 'activate',
						header: translate( 'Active' ),
						smallColumn: true,
					},
					{
						key: 'autoupdate',
						header: translate( 'Autoupdate' ),
						smallColumn: true,
					},
					{
						key: 'update',
						header: translate( 'Update available' ),
					},
					{
						key: 'last-updated',
						header: null,
					},
			  ]
			: [
					{
						key: 'sites',
						header: translate( 'Sites' ),
						smallColumn: true,
					},
					{
						key: 'update',
						header: translate( 'Update available' ),
						smallColumn: true,
					},
			  ] ),
		{
			key: 'bulk-actions',
			header: renderBulkActionsHeader(),
			colSpan: 3,
		},
	];

	if ( ! plugins.length && ! isLoading ) {
		let emptyStateMessage = translate( 'No plugins found' );
		if ( searchTerm ) {
			emptyStateMessage = translate( 'No results found. Please try refining your search.' );
		}
		return <div className="plugin-management-v2__no-sites">{ emptyStateMessage }</div>;
	}

	return (
		<div
			className={ classNames( 'plugin-management-v2__main-content-container', {
				'is-bulk-management-active': isBulkManagementActive,
			} ) }
		>
			<PluginsList
				items={ plugins }
				columns={ columns }
				isLoading={ isLoading }
				className={ classNames( {
					'has-bulk-management-active': isBulkManagementActive,
				} ) }
				selectedSite={ selectedSite }
				removePluginNotice={ removePluginNotice }
				updatePlugin={ updatePlugin }
			/>
		</div>
	);
}
