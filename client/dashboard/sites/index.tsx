import { DataViews, filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button, Modal, Icon } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { useAuth } from '../app/auth';
import { isAutomatticianQuery } from '../app/queries/a8c';
import { sitesQuery } from '../app/queries/sites';
import { sitesRoute } from '../app/router';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { isP2 } from '../utils/site-types';
import AddNewSite from './add-new-site';
import { canManageSite } from './features';
import { getFields } from './fields';
import { SitesNotices } from './notices';
import { getView, DEFAULT_LAYOUTS } from './views';
import type { FetchSitesOptions, Site } from '../data/types';
import type { View, ViewTable, ViewGrid, Filter, RenderModalProps } from '@automattic/dataviews';
import type { AnyRouter } from '@tanstack/react-router';

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
		{
			id: 'leave',
			label: __( 'Leave site' ),
			isEligible: ( item: Site ) => ! item.is_deleted && ! isP2( item ),
			RenderModal: ( { items, closeModal }: RenderModalProps< Site > ) => {
				return (
					<AsyncLoad
						require="./site-leave-modal/content-info"
						placeholder={ null }
						site={ items[ 0 ] }
						onClose={ closeModal }
					/>
				);
			},
		},
	];
};

const getFetchSitesOptions = (
	view: View,
	isRestoringAccount: boolean = false
): FetchSitesOptions => {
	const filters = view.filters ?? [];

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
		site_visibility: view.search || shouldIncludeA8COwned || isRestoringAccount ? 'all' : 'visible',
		include_a8c_owned: shouldIncludeA8COwned,
	};
};

export default function Sites() {
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const router = useRouter();
	const currentSearchParams = sitesRoute.useSearch();
	const viewOptions: Partial< ViewTable | ViewGrid > | undefined = currentSearchParams.view;
	const isRestoringAccount = !! currentSearchParams.restored;

	const { user } = useAuth();
	const { data: isAutomattician } = useQuery( isAutomatticianQuery() );

	const { defaultView, view } = useMemo( () => {
		return getView( { user, isAutomattician, isRestoringAccount, viewOptions } );
	}, [ user, isAutomattician, isRestoringAccount, viewOptions ] );

	const { data: sites, isLoading: isLoadingSites } = useQuery(
		sitesQuery( getFetchSitesOptions( view, isRestoringAccount ) )
	);

	const fields = useMemo( () => {
		return getFields( { isAutomattician, viewType: view.type } );
	}, [ isAutomattician, view.type ] );

	const actions = useMemo( () => {
		return getDefaultActions( router );
	}, [ router ] );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites ?? [], view, fields );
	const [ isModalOpen, setIsModalOpen ] = useState( false );

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
				<SitesNotices />
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
									...currentSearchParams,
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
