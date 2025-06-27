import { DataViews, filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button, Modal, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { isAutomatticianQuery } from '../app/queries/a8c';
import { sitesQuery } from '../app/queries/sites';
import { sitesRoute } from '../app/router';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import AddNewSite from './add-new-site';
import { canManageSite } from './features';
import { getFields } from './fields';
import type { FetchSitesOptions, Site } from '../data/types';
import type { Operator, SortDirection, ViewTable, ViewGrid, Filter } from '@automattic/dataviews';
import type { AnyRouter } from '@tanstack/react-router';

const DEFAULT_LAYOUTS = {
	table: {
		mediaField: 'icon.ico',
		fields: [ 'status', 'visitors', 'subscribers_count', 'wp_version' ],
		titleField: 'name',
		descriptionField: 'URL',
	},
	grid: {
		mediaField: 'preview',
		fields: [ 'status' ],
		titleField: 'name',
		descriptionField: 'URL',
	},
};

const DEFAULT_VIEW = {
	...DEFAULT_LAYOUTS.grid,
	type: 'grid' as const,
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' as SortDirection },
	search: '',
};

const getDefaultActions = ( router: AnyRouter ) => {
	return [
		{
			id: 'admin',
			isPrimary: true,
			icon: <Icon icon={ wordpress } />,
			label: __( 'WP admin ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				if ( site.options?.admin_url ) {
					window.open( site.options.admin_url, '_blank' );
				}
			},
			isEligible: ( item: Site ) => ( item.is_deleted || ! item.options?.admin_url ? false : true ),
		},
		{
			id: 'site',
			label: __( 'Visit site ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				if ( site.URL ) {
					window.open( site.URL, '_blank' );
				}
			},
			isEligible: ( item: Site ) => ( item.is_deleted || ! item.URL ? false : true ),
		},
		{
			id: 'domains',
			label: __( 'Domains ↗' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				window.open( `/domains/manage/${ site.slug }` );
			},
			isEligible: ( item: Site ) => canManageSite( item ),
		},
		{
			id: 'settings',
			label: __( 'Settings' ),
			callback: ( sites: Site[] ) => {
				const site = sites[ 0 ];
				router.navigate( { to: '/sites/$siteSlug/settings', params: { siteSlug: site.slug } } );
			},
			isEligible: ( item: Site ) => canManageSite( item ),
		},
	];
};

const getFetchSitesOptions = (
	viewOptions: Partial< ViewTable | ViewGrid > | undefined = {}
): FetchSitesOptions => {
	const filters = viewOptions.filters ?? [];

	// Include A8C sites unless explicitly excluded from the filter.
	const shouldIncludeA8COwned = ! filters.some(
		( item: Filter ) => item.field === 'is_a8c' && item.value === false
	);

	if ( filters.find( ( item: Filter ) => item.field === 'status' && item.value === 'deleted' ) ) {
		return { site_visibility: 'deleted', include_a8c_owned: shouldIncludeA8COwned };
	}

	return {
		// Some P2 sites are not retrievable unless site_visibility is set to 'all'.
		// See: https://github.com/Automattic/wp-calypso/pull/104220.
		site_visibility: viewOptions.search || shouldIncludeA8COwned ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
	};
};

export default function Sites() {
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const router = useRouter();
	const viewOptions: Partial< ViewTable | ViewGrid > | undefined = sitesRoute.useSearch().view;
	const { data: sites, isLoading: isLoadingSites } = useQuery(
		sitesQuery( getFetchSitesOptions( viewOptions ) )
	);
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	const defaultView = useMemo(
		() =>
			isAutomattician
				? {
						...DEFAULT_VIEW,
						filters: [
							{
								field: 'is_a8c',
								operator: 'is' as Operator,
								value: false,
							},
						],
				  }
				: DEFAULT_VIEW,
		[ isAutomattician ]
	);

	const view = useMemo(
		() => ( {
			...defaultView,
			...DEFAULT_LAYOUTS[ viewOptions?.type ?? DEFAULT_VIEW.type ],
			...( viewOptions
				? Object.fromEntries(
						Object.entries( viewOptions ).filter( ( [ , v ] ) => v !== undefined )
				  )
				: {} ),
		} ),
		[ defaultView, viewOptions ]
	);

	const fields = useMemo( () => {
		return getFields( { isAutomattician, viewType: view.type } );
	}, [ isAutomattician, view.type ] );

	const actions = useMemo( () => {
		return getDefaultActions( router );
	}, [ router ] );

	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites ?? [], view, fields );

	return (
		<>
			{ isModalOpen && (
				<Modal title={ __( 'Add New Site' ) } onRequestClose={ () => setIsModalOpen( false ) }>
					<AddNewSite context="sites-dashboard" />
				</Modal>
			) }
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Sites' ) }
						actions={
							<Button
								variant="primary"
								onClick={ () => setIsModalOpen( true ) }
								__next40pxDefaultSize
							>
								{ __( 'Add New Site' ) }
							</Button>
						}
					/>
				}
			>
				<DataViewsCard>
					<DataViews< Site >
						getItemId={ ( item ) => item.ID.toString() }
						data={ filteredData }
						fields={ fields }
						actions={ actions }
						view={ view }
						isLoading={ isLoadingSites }
						onChangeView={ ( view ) => {
							if ( view.type === 'list' ) {
								return;
							}
							const _defaultView = { ...defaultView, ...DEFAULT_LAYOUTS[ view.type ] };
							navigate( {
								search: {
									view: Object.fromEntries(
										Object.entries( view ).filter( ( [ key, value ] ) => {
											return value !== _defaultView[ key as keyof typeof _defaultView ];
										} )
									),
								},
							} );
						} }
						defaultLayouts={ DEFAULT_LAYOUTS }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</PageLayout>
		</>
	);
}
