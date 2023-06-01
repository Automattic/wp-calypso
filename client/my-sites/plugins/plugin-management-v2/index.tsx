import { Button } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useEffect } from 'react';
import ButtonGroup from 'calypso/components/button-group';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { useDispatch } from 'calypso/state';
import { resetPluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import PluginsList from './plugins-list';
import UpdatePlugins from './update-plugins';
import { pluginsEmptyMessage } from './utils/get-plugins-empty-message';
import type { PluginComponentProps } from './types';
import type { SiteDetails } from '@automattic/data-stores';
import type { PluginFilter } from 'calypso/state/plugins/installed/types';

import './style.scss';

interface Props {
	plugins: Array< PluginComponentProps >;
	isLoading: boolean;
	requestError: boolean;
	selectedSite?: SiteDetails;
	searchTerm: string;
	isBulkManagementActive: boolean;
	toggleBulkManagement: () => void;
	removePluginNotice: ( plugin: PluginComponentProps ) => void;
	updatePlugin: ( plugin: PluginComponentProps ) => void;
	isJetpackCloud: boolean;
	filter: PluginFilter;
}
export default function PluginManagementV2( {
	plugins,
	isLoading,
	selectedSite,
	searchTerm,
	isBulkManagementActive,
	toggleBulkManagement,
	removePluginNotice,
	updatePlugin,
	isJetpackCloud,
	requestError,
	filter,
}: Props ): ReactElement | null {
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
				{ isJetpackCloud && <UpdatePlugins plugins={ plugins } /> }
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
		if ( requestError ) {
			return null;
		}
		let emptyStateMessage = pluginsEmptyMessage?.[ filter ];
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
