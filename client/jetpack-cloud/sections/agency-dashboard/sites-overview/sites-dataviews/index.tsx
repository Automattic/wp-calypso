import { DataViews } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import SiteActions from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-actions';
import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { AllowedTypes, Site, SiteData } from '../types';

import './style.scss';

interface Props {
	data:
		| { sites: Array< Site >; total: number; perPage: number; totalFavorites: number }
		| undefined;
	isLoading: boolean;
}

const SitesDataViews = ( { data, isLoading }: Props ) => {
	const translate = useTranslate();

	const view = {
		type: 'table',
		perPage: 10,
		page: 1,
		sort: {
			field: 'site',
			direction: 'desc',
		},
		search: '',
		filters: [ { field: 'status', operator: 'in', value: 'Needs attention' } ],
		hiddenFields: [ 'status' ],
		layout: {},
	};

	const sites = useFormattedSites( data?.sites ?? [] );

	const renderField = useCallback(
		( column: AllowedTypes, item: SiteData ) => {
			if ( isLoading ) {
				return <TextPlaceholder />;
			}

			if ( column ) {
				return (
					<SiteStatusContent
						rows={ item }
						type={ column }
						isLargeScreen
						isFavorite={ item.isFavorite }
						siteError={ item.site.error }
					/>
				);
			}
		},
		[ sites ]
	);

	const fields = [
		{
			id: 'status',
			header: '',
			getValue: ( { item }: { item: SiteData } ) =>
				item.site.error || item.scan.status === 'critical',
			render: () => {},
			type: 'enumeration',
			elements: [
				{ value: 1, label: 'Needs attention' },
				{ value: 2, label: 'Favorite' },
			],
			enableHiding: true,
			enableSorting: true,
		},
		{
			id: 'site',
			header: translate( 'SITE' ),
			getValue: ( { item }: { item: SiteData } ) => item.site.value.url,
			render: ( { item }: { item: SiteData } ) => {
				if ( isLoading ) {
					return <TextPlaceholder />;
				}
				const site = item.site.value;
				return (
					<div className="sites-dataviews__site">
						<div className="sites-dataviews__site-favicon"></div>
						<div className="sites-dataviews__site-name">
							<div>{ site.blogname }</div>
							<div className="sites-dataviews__site-url">{ site.url }</div>
						</div>
					</div>
				);
			},
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'boost',
			header: 'BOOST',
			getValue: ( { item }: { item: SiteData } ) => item.boost.status,
			render: ( { item }: { item: SiteData } ) => renderField( 'boost', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'backup',
			header: 'BACKUP',
			getValue: () => 'Backup status',
			render: ( { item }: { item: SiteData } ) => renderField( 'backup', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'monitor',
			header: 'MONITOR',
			getValue: () => 'Monitor status',
			render: ( { item }: { item: SiteData } ) => renderField( 'monitor', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'scan',
			header: 'SCAN',
			getValue: () => 'Scan status',
			render: ( { item }: { item: SiteData } ) => renderField( 'scan', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'plugins',
			header: 'PLUGINS',
			getValue: () => 'Plugins status',
			render: ( { item }: { item: SiteData } ) => renderField( 'plugin', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'stats',
			header: 'STATS',
			getValue: () => 'Stats status',
			render: ( { item }: { item: SiteData } ) => renderField( 'stats', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'favorite',
			header: '★',
			getValue: ( { item }: { item: SiteData } ) => item.isFavorite,
			render: ( { item }: { item: SiteData } ) => {
				if ( isLoading ) {
					return <TextPlaceholder />;
				}
				return <div>{ item.isFavorite ? '★' : '☆' }</div>;
			},
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'actions',
			header: translate( 'ACTIONS' ),
			getValue: ( { item }: { item: SiteData } ) => item.isFavorite,
			render: ( { item }: { item: SiteData } ) => {
				if ( isLoading ) {
					return <TextPlaceholder />;
				}
				return <SiteActions isLargeScreen site={ item.site } siteError={ item.site.error } />;
			},
			enableHiding: false,
			enableSorting: false,
		},
	];

	/*const actions = [
		{
			id: 'issue_license',
			label: 'Issue new license',
			isPrimary: false,
		},
		{
			id: 'view_activity',
			label: 'View activity',
			isPrimary: false,
		},
		{
			id: 'copy_site',
			label: 'Copy this site',
			isPrimary: false,
		},
		{
			id: 'View site',
			label: 'Issue new license',
			isPrimary: false,
		},
		{
			id: 'Visit WP Admin',
			label: 'Issue new license',
			isPrimary: false,
		},
	];*/

	return (
		<>
			<div style={ { marginBottom: '40px', textAlign: 'center' } }>
				<b>Hello DataViews!</b>
				<br />
				The is a quick working prototype of the Table Atelier in Jetpack Manage
			</div>

			<DataViews
				data={ sites }
				paginationInfo={ { totalItems: 0, totalPages: 0 } }
				fields={ fields }
				view={ view }
				search={ true }
				searchLabel="Search sites"
				getItemId={ ( item: SiteData ) => {
					if ( isLoading ) {
						return '';
					}
					return item.site.value.blog_id;
				} }
				onChangeView={ () => {} }
				supportedLayouts={ [ 'table' ] }
				actions={ [] }
				isLoading={ isLoading }
			/>
		</>
	);
};

export default SitesDataViews;
