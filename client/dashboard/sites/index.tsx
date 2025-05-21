import { DataViews, filterSortAndPaginate } from '@automattic/dataviews';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from '@tanstack/react-router';
import { Button, Dropdown } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useMemo } from 'react';
import { sitesQuery } from '../app/queries';
import { sitesRoute } from '../app/router';
import DataViewsCard from '../components/dataviews-card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { STATUS_LABELS, getSiteStatus, getSiteStatusLabel } from '../utils/site-status';
import AddNewSite from './add-new-site';
import SiteIcon from './site-icon';
import SitePreview from './site-preview';
import type { Site } from '../data/types';
import type { Field, Operator, SortDirection, ViewTable, ViewGrid } from '@automattic/dataviews';

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
	},
	{
		id: 'URL',
		label: __( 'URL' ),
		enableGlobalSearch: true,
		render: ( { item }: { item: Site } ) => new URL( item.URL ).hostname,
	},
	{
		id: 'icon.ico',
		label: __( 'Media' ),
		render: ( { item }: { item: Site } ) => <SiteIcon site={ item } />,
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
		getValue: ( { item }: { item: Site } ) => !! item.plan?.features?.active?.includes( 'backups' ),
		elements: [
			{ value: true, label: __( 'Enabled' ) },
			{ value: false, label: __( 'Disabled' ) },
		],
		render: ( { item }: { item: Site } ) =>
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
		id: 'protect',
		type: 'boolean',
		label: __( 'Protect' ),
		getValue: ( { item }: { item: Site } ) => !! item.active_modules?.includes( 'protect' ),
		render: ( { item }: { item: Site } ) =>
			item.active_modules?.includes( 'protect' ) ? <Icon icon={ check } /> : __( 'Disabled' ),
		elements: [
			{ value: true, label: __( 'Enabled' ) },
			{ value: false, label: __( 'Disabled' ) },
		],
		filterBy: {
			operators: [ 'is' as Operator ],
		},
	},
	{
		id: 'status',
		label: __( 'Status' ),
		getValue: ( { item }: { item: Site } ) => getSiteStatus( item ),
		elements: Object.entries( STATUS_LABELS ).map( ( [ value, label ] ) => ( { value, label } ) ),
		render: ( { item }: { item: Site } ) => getSiteStatusLabel( item ),
	},
	{
		id: 'is_a8c',
		type: 'boolean',
		label: __( 'A8C Owned' ),
		elements: [
			{ value: true, label: __( 'Yes' ) },
			{ value: false, label: __( 'No' ) },
		],
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		render: ( { item }: { item: Site } ) => ( item.is_a8c ? __( 'Yes' ) : __( 'No' ) ),
	},
	{
		id: 'preview',
		label: __( 'Preview' ),
		render: function PreviewRender( { item }: { item: Site } ) {
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
];

const DEFAULT_LAYOUTS = {
	table: {
		mediaField: 'icon.ico',
		fields: [ 'subscribers_count', 'status', 'backups', 'protect' ],
		titleField: 'name',
		descriptionField: 'URL',
	},
	grid: {
		mediaField: 'preview',
		fields: [],
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

export default function Sites() {
	const navigate = useNavigate( { from: sitesRoute.fullPath } );
	const sites = useQuery( sitesQuery() ).data;
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
	const search: Partial< ViewTable | ViewGrid > | undefined = sitesRoute.useSearch().view;
	const view = useMemo(
		() => ( {
			...defaultView,
			...DEFAULT_LAYOUTS[ search?.type ?? DEFAULT_VIEW.type ],
			...( search
				? Object.fromEntries( Object.entries( search ).filter( ( [ , v ] ) => v !== undefined ) )
				: {} ),
		} ),
		[ defaultView, search ]
	);
	const fields = useMemo(
		() =>
			hasA8CSites ? DEFAULT_FIELDS : DEFAULT_FIELDS.filter( ( field ) => field.id !== 'is_a8c' ),
		[ hasA8CSites ]
	);

	if ( ! sites ) {
		return;
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	return (
		<>
			<PageLayout
				header={
					<PageHeader
						title={ __( 'Sites' ) }
						actions={
							<Dropdown
								popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false } }
								focusOnMount
								renderToggle={ ( { isOpen, onToggle } ) => (
									<Button
										variant="primary"
										onClick={ onToggle }
										__next40pxDefaultSize
										aria-expanded={ isOpen }
									>
										{ __( 'Add New Site' ) }
									</Button>
								) }
								renderContent={ () => <AddNewSite /> }
							/>
						}
					/>
				}
			>
				<DataViewsCard>
					<DataViews< Site >
						getItemId={ ( item ) => item.ID }
						data={ filteredData }
						fields={ fields }
						actions={ actions }
						view={ view }
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
						renderItemLink={ ( { item, ...props }: { item: Site } ) => (
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
