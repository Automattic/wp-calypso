import { DataViews, filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from '@tanstack/react-router';
import { Button, Modal, ExternalLink } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../app/analytics';
import { sitesQuery } from '../app/queries/sites';
import { sitesRoute } from '../app/router';
import ComponentViewTracker from '../components/component-view-tracker';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import TimeSince from '../components/time-since';
import { STATUS_LABELS, getSiteStatus, getSiteStatusLabel } from '../utils/site-status';
import { getFormattedWordPressVersion } from '../utils/wp-version';
import AddNewSite from './add-new-site';
import { Uptime } from './site-fields';
import SiteIcon from './site-icon';
import SitePreview from './site-preview';
import type { FetchSitesOptions, Site } from '../data/types';
import type {
	Field,
	Operator,
	SortDirection,
	ViewTable,
	ViewGrid,
	Filter,
} from '@automattic/dataviews';

const actions = [
	{
		id: 'admin',
		isPrimary: true,
		label: __( 'WP Admin' ),
		callback: ( sites: Site[] ) => {
			const site = sites[ 0 ];
			if ( site.options?.admin_url ) {
				window.location.href = site.options.admin_url;
			}
		},
		isEligible: ( item: Site ) => ( item.is_deleted || ! item.options?.admin_url ? false : true ),
	},
];

const DEFAULT_FIELDS: Field< Site >[] = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableGlobalSearch: true,
		getValue: ( { item } ) => item.name || new URL( item.URL ).hostname,
		render: ( { field, item } ) => (
			<span style={ { overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
				{ field.getValue( { item } ) }
			</span>
		),
	},
	{
		id: 'URL',
		label: __( 'URL' ),
		enableGlobalSearch: true,
		getValue: ( { item } ) => new URL( item.URL ).hostname,
		render: ( { field, item } ) => (
			<span style={ { overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
				{ field.getValue( { item } ) }
			</span>
		),
	},
	{
		id: 'icon.ico',
		label: __( 'Site icon' ),
		render: ( { item } ) => <SiteIcon site={ item } />,
		enableSorting: false,
	},
	{
		id: 'subscribers_count',
		label: __( 'Subscribers' ),
	},
	{
		id: 'backups',
		type: 'boolean',
		label: __( 'Backups' ),
		getValue: ( { item } ) => !! item.plan?.features?.active?.includes( 'backups' ),
		elements: [
			{ value: true, label: __( 'Enabled' ) },
			{ value: false, label: __( 'Disabled' ) },
		],
		render: ( { item } ) =>
			item.plan?.features?.active?.includes( 'backups' ) ? (
				<Icon icon={ check } />
			) : (
				__( 'Disabled' )
			),
		filterBy: {
			operators: [ 'is' as Operator ],
		},
	},
	{
		id: 'status',
		label: __( 'Status' ),
		getValue: ( { item } ) => getSiteStatus( item ),
		elements: Object.entries( STATUS_LABELS ).map( ( [ value, label ] ) => ( { value, label } ) ),
		filterBy: {
			operators: [ 'is' ],
		},
		render: ( { item } ) => {
			const label = getSiteStatusLabel( item );
			if ( item.launch_status !== 'unlaunched' ) {
				return label;
			}

			return (
				<ComingSoonStatusButton href={ `/home/${ item.slug }` }>{ label }</ComingSoonStatusButton>
			);
		},
	},
	{
		id: 'wp_version',
		label: __( 'WP version' ),
		getValue: ( { item } ) => getFormattedWordPressVersion( item ),
	},
	{
		id: 'is_a8c',
		type: 'boolean',
		label: __( 'A8C owned' ),
		elements: [
			{ value: true, label: __( 'Yes' ) },
			{ value: false, label: __( 'No' ) },
		],
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		render: ( { item } ) => ( item.is_a8c ? __( 'Yes' ) : __( 'No' ) ),
	},
	{
		id: 'preview',
		label: __( 'Preview' ),
		render: function PreviewRender( { item } ) {
			const [ resizeListener, { width } ] = useResizeObserver();
			const { is_deleted, is_private, URL: url } = item;
			// If the site is a private A8C site, X-Frame-Options is set to same
			// origin.
			const iframeDisabled = is_deleted || ( item.is_a8c && is_private );
			return (
				<>
					{ resizeListener }
					{ iframeDisabled && (
						<div
							style={ {
								fontSize: '24px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
							} }
						>
							<SiteIcon site={ item } />
						</div>
					) }
					{ width && ! iframeDisabled && (
						<SitePreview url={ url } scale={ width / 1200 } height={ 1200 } />
					) }
				</>
			);
		},
		enableSorting: false,
	},
	{
		id: 'last_published',
		label: __( 'Last published' ),
		getValue: ( { item } ) => item.options?.updated_at ?? '',
		render: ( { item } ) =>
			item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
	},
	{
		id: 'uptime',
		label: __( 'Uptime' ),
		render: ( { item } ) => <Uptime site={ item } />,
		enableSorting: false,
	},
];

const DEFAULT_LAYOUTS = {
	table: {
		mediaField: 'icon.ico',
		fields: [ 'subscribers_count', 'status', 'backups', 'protect', 'wp_version' ],
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

const getFetchSitesOptions = (
	viewOptions: Partial< ViewTable | ViewGrid > | undefined = {}
): FetchSitesOptions => {
	if (
		viewOptions.filters?.find(
			( filter: Filter ) => filter.field === 'status' && filter.value === 'deleted'
		)
	) {
		return { site_visibility: 'deleted' };
	}

	return { site_visibility: viewOptions.search ? 'all' : 'visible' };
};

export default function Sites() {
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const viewOptions: Partial< ViewTable | ViewGrid > | undefined = sitesRoute.useSearch().view;
	const { data: sites, isLoading: isLoadingSites } = useQuery(
		sitesQuery( getFetchSitesOptions( viewOptions ) )
	);
	const hasA8CSites = sites?.some( ( site ) => site.is_a8c );

	const defaultView = useMemo(
		() =>
			hasA8CSites
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
		[ hasA8CSites ]
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
		return DEFAULT_FIELDS.filter( ( field ) => {
			if ( field.id === 'is_a8c' && ! hasA8CSites ) {
				return false;
			}

			if ( field.id === 'icon.ico' && view.type === 'grid' ) {
				return false;
			}

			return true;
		} );
	}, [ hasA8CSites, view.type ] );

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
						renderItemLink={ ( { item, ...props } ) => (
							<Link to={ `/sites/${ item.slug }` } { ...props } />
						) }
						defaultLayouts={ DEFAULT_LAYOUTS }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</PageLayout>
		</>
	);
}

function ComingSoonStatusButton( { href, children }: { href: string; children: React.ReactNode } ) {
	const { recordTracksEvent } = useAnalytics();

	return (
		<>
			<ComponentViewTracker eventName="calypso_dashboard_site_launch_nag_impression" />
			<ExternalLink
				href={ href }
				onClick={ () => {
					recordTracksEvent( 'calypso_dashboard_site_launch_nag_click' );
				} }
				style={ { position: 'absolute' } }
			>
				{ children }
			</ExternalLink>
		</>
	);
}
