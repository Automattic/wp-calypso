import { DataViews } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import SiteActions from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-actions';
import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { AllowedTypes, SiteData } from '../types';
import { SitesDataViewsProps } from './interfaces';
import './style.scss';

const SitesDataViews = ( {
	data,
	isLoading,
	onSitesViewChange,
	sitesViewState,
}: SitesDataViewsProps ) => {
	const translate = useTranslate();

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
		[ isLoading ]
	);

	const fields = [
		{
			id: 'status',
			header: translate( 'Status' ),
			getValue: ( { item }: { item: SiteData } ) =>
				item.site.error || item.scan.status === 'critical',
			render: () => {},
			type: 'enumeration',
			elements: [
				{ value: 1, label: 'Needs Attention' },
				{ value: 2, label: 'Favorite' },
				{ value: 3, label: 'Backup Failed' },
				{ value: 4, label: 'Backup Warning' },
				{ value: 5, label: 'Threat Found' },
				{ value: 6, label: 'Site Disconnected' },
				{ value: 7, label: 'Site Down' },
				{ value: 8, label: 'Plugins Needing Updates' },
			],
			filterBy: {
				operators: [ 'in' ],
			},
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
			id: 'stats',
			header: 'STATS',
			getValue: () => 'Stats status',
			render: ( { item }: { item: SiteData } ) => renderField( 'stats', item ),
			enableHiding: false,
			enableSorting: false,
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

	// TODO: remove this hardcoded style. If we set background in the CSS it will be loaded with and without the feature flag:
	document.body.style.backgroundColor = 'white';

	return (
		<>
			<DataViews
				data={ sites }
				paginationInfo={ { totalItems: 0, totalPages: 0 } }
				fields={ fields }
				view={ sitesViewState }
				search={ true }
				searchLabel={ translate( 'Search sites' ) }
				getItemId={ ( item: SiteData ) => {
					if ( isLoading ) {
						return '';
					}
					return item.site.value.blog_id;
				} }
				onChangeView={ onSitesViewChange }
				supportedLayouts={ [ 'table' ] }
				actions={ [] }
				isLoading={ isLoading }
			/>
		</>
	);
};

export default SitesDataViews;
