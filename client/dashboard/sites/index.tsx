import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, ExternalLink } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useState, useMemo } from 'react';
import { sitesQuery } from '../app/queries';
import DataViewsCard from '../dataviews-card';
import PageLayout from '../page-layout';
import SiteIcon from '../site-icon';
import SitePreview from '../site-preview';
import { isA8CSite } from '../utils/site-owner';
import { STATUS_LABELS, getSiteStatus, getSiteStatusLabel } from '../utils/site-status';
import type { Site } from '../data/types';
import type { View, Operator } from '@wordpress/dataviews';

const actions = [
	{
		id: 'admin',
		isPrimary: true,
		label: __( 'WP Admin' ),
		callback: ( sites: Site[] ) => {
			const site = sites[ 0 ];
			window.location.href = site.options?.admin_url ?? '';
		},
		isEligible: ( item: Site ) => ( item.is_deleted ? false : true ),
	},
];

const DEFAULT_FIELDS = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableGlobalSearch: true,
	},
	{
		id: 'URL',
		label: __( 'URL' ),
		enableGlobalSearch: true,
		render: ( { item }: { item: Site } ) => (
			<ExternalLink href={ item.URL }>{ new URL( item.URL ).hostname }</ExternalLink>
		),
	},
	{
		id: 'icon.ico',
		label: __( 'Media' ),
		render: ( { item }: { item: Site } ) => <SiteIcon site={ item } />,
	},
	{
		id: 'subscribers_count',
		label: __( 'Subscribers' ),
	},
	{
		id: 'backups',
		label: __( 'Backups' ),
		getValue: ( { item }: { item: Site } ) =>
			item.plan.features.active.includes( 'backups' ) || undefined,
		elements: [
			{ value: true, label: __( 'Enabled' ) },
			{ value: undefined, label: __( 'Disabled' ) },
		],
		render: ( { item }: { item: Site } ) =>
			item.plan.features.active.includes( 'backups' ) ? <Icon icon={ check } /> : __( 'Disabled' ),
		filterBy: {
			operators: [ 'is' as Operator ],
		},
	},
	{
		id: 'protect',
		label: __( 'Protect' ),
		getValue: ( { item }: { item: Site } ) =>
			item.active_modules?.includes( 'protect' ) || undefined,
		render: ( { item }: { item: Site } ) =>
			item.active_modules?.includes( 'protect' ) ? <Icon icon={ check } /> : __( 'Disabled' ),
		elements: [
			{ value: true, label: __( 'Enabled' ) },
			{ value: undefined, label: __( 'Disabled' ) },
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
		id: 'a8c_owned',
		label: __( 'A8C Owned' ),
		getValue: ( { item }: { item: Site } ) => isA8CSite( item ) || undefined,
		elements: [
			{ value: true, label: __( 'Yes' ) },
			{ value: undefined, label: __( 'No' ) },
		],
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		render: ( { item }: { item: Site } ) => ( isA8CSite( item ) ? __( 'Yes' ) : __( 'No' ) ),
	},
	{
		id: 'preview',
		label: __( 'Preview' ),
		render: function PreviewRender( { item }: { item: Site } ) {
			const [ resizeListener, { width } ] = useResizeObserver();
			const { options, URL: url } = item;
			const { blog_public } = options;
			// If the site is a private A8C site, X-Frame-Options is set to same
			// origin.
			const iframeDisabled = isA8CSite( item ) && blog_public === -1;
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

const DEFAULT_VIEW: View = {
	...DEFAULT_LAYOUTS.grid,
	type: 'grid',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

export default function Sites() {
	const navigate = useNavigate();
	const sites = useQuery( sitesQuery() ).data;
	const hasA8CSites = sites?.some( isA8CSite );
	const [ view, setView ] = useState< View >(
		hasA8CSites
			? {
					...DEFAULT_VIEW,
					filters: [
						{
							field: 'a8c_owned',
							operator: 'is',
							value: undefined,
						},
					],
			  }
			: DEFAULT_VIEW
	);
	const fields = useMemo(
		() =>
			hasA8CSites ? DEFAULT_FIELDS : DEFAULT_FIELDS.filter( ( field ) => field.id !== 'a8c_owned' ),
		[ hasA8CSites ]
	);

	if ( ! sites ) {
		return;
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const onClickItem = ( item: Site ) => {
		navigate( { to: `/sites/${ item.ID }` } );
	};

	return (
		<>
			<PageLayout
				title={ __( 'Sites' ) }
				actions={
					<Button variant="primary" __next40pxDefaultSize>
						{ __( 'Add New Site' ) }
					</Button>
				}
			>
				<DataViewsCard>
					<DataViews
						getItemId={ ( item ) => item.ID }
						data={ filteredData }
						fields={ fields }
						actions={ actions }
						view={ view }
						onChangeView={ setView }
						onClickItem={ onClickItem }
						defaultLayouts={ DEFAULT_LAYOUTS }
						paginationInfo={ paginationInfo }
					/>
				</DataViewsCard>
			</PageLayout>
		</>
	);
}
