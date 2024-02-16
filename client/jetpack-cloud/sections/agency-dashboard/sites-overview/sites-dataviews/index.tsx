import { DataViews } from '@wordpress/dataviews';
import { Icon, starFilled } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import SiteActions from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-actions';
import useFormattedSites from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-content/hooks/use-formatted-sites';
import SiteStatusContent from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-status-content';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import SiteSetFavorite from '../site-set-favorite';
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
			header: <span>{ translate( 'SITE' ) }</span>,
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
			header: <span>STATS</span>,
			getValue: () => 'Stats status',
			render: ( { item }: { item: SiteData } ) => renderField( 'stats', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'boost',
			header: <span>BOOST</span>,
			getValue: ( { item }: { item: SiteData } ) => item.boost.status,
			render: ( { item }: { item: SiteData } ) => renderField( 'boost', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'backup',
			header: <span>BACKUP</span>,
			getValue: () => 'Backup status',
			render: ( { item }: { item: SiteData } ) => renderField( 'backup', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'monitor',
			header: <span>MONITOR</span>,
			getValue: () => 'Monitor status',
			render: ( { item }: { item: SiteData } ) => renderField( 'monitor', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'scan',
			header: <span>SCAN</span>,
			getValue: () => 'Scan status',
			render: ( { item }: { item: SiteData } ) => renderField( 'scan', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'plugins',
			header: <span>PLUGINS</span>,
			getValue: () => 'Plugins status',
			render: ( { item }: { item: SiteData } ) => renderField( 'plugin', item ),
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'favorite',
			header: <Icon className="site-table__favorite-icon" size={ 24 } icon={ starFilled } />,
			getValue: ( { item }: { item: SiteData } ) => item.isFavorite,
			render: ( { item }: { item: SiteData } ) => {
				if ( isLoading ) {
					return <TextPlaceholder />;
				}
				return (
					<span className="sites-dataviews__favorite-btn-wrapper">
						<SiteSetFavorite
							isFavorite={ item.isFavorite || false }
							siteId={ item.site.value.blog_id }
							siteUrl={ item.site.value.url }
						/>
					</span>
				);
			},
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'actions',
			header: <span>{ translate( 'ACTIONS' ) }</span>,
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
