import clsx from 'clsx';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { ReactElement, useEffect, useMemo } from 'react';
import PluginOverviewTour from 'calypso/jetpack-cloud/sections/onboarding-tours/plugin-overview-tour';
import { useDispatch } from 'calypso/state';
import { resetPluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import BulkActionsHeader from './bulk-actions-header';
import PluginsList from './plugins-list';
import type { PluginComponentProps } from './types';
import type { SiteDetails } from '@automattic/data-stores';
import type { PluginFilter } from 'calypso/state/plugins/installed/types';

import './style.scss';

export const useEmptyMessage = (
	searchTerm: string,
	filter: PluginFilter
): TranslateResult | undefined => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( searchTerm ) {
			return translate( 'No results found. Please try refining your search.' );
		}

		const getMessage = (
			{
				all: ( translate ) => translate( 'No plugins found.' ),
				active: ( translate ) => translate( 'No plugins are active.' ),
				inactive: ( translate ) => translate( 'No plugins are inactive.' ),
				updates: ( translate ) => translate( 'All plugins are up to date.' ),
			} as Partial<
				Record< PluginFilter, ( translate: ReturnType< typeof useTranslate > ) => TranslateResult >
			>
		 )[ filter ];

		return getMessage?.( translate );
	}, [ searchTerm, translate, filter ] );
};

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
	const emptyMessage = useEmptyMessage( searchTerm, filter );

	useEffect( () => {
		return () => {
			dispatch( resetPluginStatuses() );
		};
	}, [ dispatch ] );

	const columns = [
		{
			key: 'plugin',
			header: (
				<span id="plugin-management-v2__installed-plugins-table-header">
					{ translate( 'Installed Plugins' ) }
				</span>
			),
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
			header: (
				<BulkActionsHeader
					isLoading={ isLoading }
					showUpdatePlugins={ isJetpackCloud }
					plugins={ plugins }
					onClickEditAll={ toggleBulkManagement }
				/>
			),
			colSpan: 3,
		},
	];

	if ( ! plugins.length && ! isLoading ) {
		if ( requestError ) {
			return null;
		}

		return <div className="plugin-management-v2__no-sites">{ emptyMessage }</div>;
	}

	return (
		<>
			<div
				className={ clsx( 'plugin-management-v2__main-content-container', {
					'is-bulk-management-active': isBulkManagementActive,
				} ) }
			>
				<PluginsList
					items={ plugins }
					columns={ columns }
					isLoading={ isLoading }
					className={ clsx( {
						'has-bulk-management-active': isBulkManagementActive,
					} ) }
					selectedSite={ selectedSite }
					removePluginNotice={ removePluginNotice }
					updatePlugin={ updatePlugin }
				/>
			</div>
			<PluginOverviewTour isLoading={ isLoading } pluginCount={ plugins.length } />
		</>
	);
}
