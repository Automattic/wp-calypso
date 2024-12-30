import { filterSortAndPaginate } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { DataViews } from 'calypso/components/dataviews';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { getSitesWithSecondarySites } from 'calypso/my-sites/plugins/plugin-management-v2/utils/get-sites-with-secondary-sites';
import { useSelector } from 'calypso/state';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import PluginActivateToggle from '../../plugin-activate-toggle';
import PluginAutoupdateToggle from '../../plugin-autoupdate-toggle';
import PluginManageConnection from '../plugin-manage-connection';
import PluginManageSubcription from '../plugin-manage-subscription';
import RemovePlugin from '../remove-plugin';
import SitesList from '../sites-list';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	sites: Array< SiteDetails | null | undefined >;
	selectedSite: SiteDetails;
	isLoading: boolean;
	plugin: PluginComponentProps;
	isWpCom?: boolean;
}

export default function SitesWithInstalledPluginsList( {
	sites,
	plugin,
	selectedSite,
	isWpCom,
	...rest
}: Props ) {
	const translate = useTranslate();
	const columns = [
		{
			key: 'site-name',
			header: translate( 'Site' ),
		},
		{
			key: 'activate',
			header: translate( 'Active' ),
			smallColumn: true,
		},
		{
			key: 'autoupdate',
			header: translate( 'Autoupdate' ),
			smallColumn: true,
			colSpan: 4,
		},
		{
			key: 'update',
		},
	];

	const isFromMarketplace = useSelector( ( state ) => isMarketplaceProduct( state, plugin?.slug ) );

	const dataViewsFields = useMemo(
		() => [
			{
				id: 'domain',
				label: translate( 'Site' ),
			},
			{
				id: 'activate',
				label: translate( 'Active' ),
				getValue: ( { item }: { item: SiteDetails } ) => plugin.sites[ item.ID ].active,
				render: ( { item }: { item: SiteDetails } ) => {
					return (
						<div className="plugin-row-formatter__toggle">
							<PluginActivateToggle
								isJetpackCloud
								hideLabel={ false }
								plugin={ plugin }
								site={ item }
								disabled={ false }
							/>
						</div>
					);
				},
			},
			{
				id: 'autoupdate',
				label: translate( 'Autoupdate' ),
				getValue: ( { item }: { item: SiteDetails } ) => plugin.sites[ item.ID ].autoupdate,
				render: ( { item }: { item: SiteDetails } ) => {
					return (
						<div className="plugin-row-formatter__toggle">
							<PluginAutoupdateToggle
								plugin={ plugin }
								site={ item }
								wporg={ !! plugin.wporg }
								isMarketplaceProduct={ isFromMarketplace }
								disabled={ !! plugin.isSelectable }
							/>
						</div>
					);
				},
			},
			{ id: 'actions', label: translate( 'Actions' ) },
		],
		[ translate, plugin ]
	);

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( () => ( {
		...initialDataViewsState,
		type: 'table',
		fields: [ 'domain', 'activate', 'autoupdate', 'actions' ],
		items: sites,
		enableSearch: false,
		layout: {
			styles: {
				domain: {
					width: '60%',
					minWidth: '300px',
				},
				activate: {
					width: '70px',
				},
				autoupdate: {
					minWidth: '70px',
				},
				actions: {
					width: '50px',
				},
			},
		},
	} ) );

	const sitesWithSecondarySites = useSelector( ( state ) =>
		getSitesWithSecondarySites( state, sites )
	);

	if ( ! sitesWithSecondarySites?.length ) {
		return null;
	}

	const siteCount = sitesWithSecondarySites.length;
	const dataViewsSites = sitesWithSecondarySites
		.map( ( site ) => site.site )
		.filter( ( site ) => site && ! site.is_deleted );

	const { data, paginationInfo } = useMemo( () => {
		const result = filterSortAndPaginate( dataViewsSites, dataViewsState, dataViewsFields );

		return {
			data: result.data,
			paginationInfo: result.paginationInfo,
		};
	}, [ dataViewsSites, dataViewsState, dataViewsFields ] );

	console.log( { plugin, sites, selectedSite } );

	const renderActions = ( site: SiteDetails ) => {
		const settingsLink = plugin?.action_links?.Settings ?? null;
		return (
			<>
				<RemovePlugin site={ site } plugin={ plugin } />
				<PluginManageConnection site={ site } plugin={ plugin } />
				{ isWpCom && (
					<>
						<PluginManageSubcription site={ site } plugin={ plugin } />
						{ settingsLink && (
							<PopoverMenuItem
								className="plugin-management-v2__actions"
								icon="cog"
								href={ settingsLink }
							>
								{ translate( 'Settings' ) }
							</PopoverMenuItem>
						) }
					</>
				) }
			</>
		);
	};

	return (
		<>
			<div className="plugin-details-v2__title">
				{ translate(
					'Installed on %(count)d site',
					'Installed on %(count)d sites', // plural version of the string
					{
						count: siteCount,
						args: { count: siteCount },
					}
				) }
			</div>
			{ isWpCom && plugin.isMarketplaceProduct && <QueryUserPurchases /> }
			<DataViews
				fields={ dataViewsFields }
				data={ data }
				view={ dataViewsState }
				onChangeView={ setDataViewsState }
				paginationInfo={ paginationInfo }
				defaultLayouts={ { table: {} } }
				getItemId={ ( item ) => item.domain }
			/>
			<SitesList
				{ ...rest }
				plugin={ plugin }
				selectedSite={ selectedSite }
				items={ sitesWithSecondarySites
					.map( ( site ) => site.site )
					.filter( ( site ) => site && ! site.is_deleted ) }
				columns={ columns }
				renderActions={ renderActions }
			/>
		</>
	);
}
