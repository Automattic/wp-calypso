import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, ExternalLink } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, check } from '@wordpress/icons';
import { useState } from 'react';
import { sitesQuery } from '../app/queries';
import DataViewsCard from '../dataviews-card';
import PageLayout from '../page-layout';
import SiteIcon from '../site-icon';
import SitePreview from '../site-preview';
import type { Site } from '../data/types';
import type { View } from '@wordpress/dataviews';

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

// Field definitions
const fields = [
	{
		id: 'name',
		label: __( 'Site' ),
		enableGlobalSearch: true,
	},
	{
		id: 'url',
		label: __( 'URL' ),
		enableGlobalSearch: true,
		render: ( { item }: { item: Site } ) => (
			<ExternalLink href={ item.url }>{ new URL( item.url ).hostname }</ExternalLink>
		),
	},
	{
		id: 'media',
		label: __( 'Media' ),
		render: ( { item }: { item: Site } ) => <SiteIcon site={ item } />,
	},
	{
		id: 'subscribers',
		label: __( 'Subscribers' ),
	},
	{
		id: 'backups',
		label: __( 'Backups' ),
		elements: [
			{ value: 'enabled', label: __( 'Enabled' ) },
			{ value: 'disabled', label: __( 'Disabled' ) },
		],
		render: ( { item }: { item: Site } ) => {
			if ( item.backups === 'enabled' ) {
				return <Icon icon={ check } />;
			}

			return __( 'Disabled' );
		},
	},
	{
		id: 'protect',
		label: __( 'Protect' ),
		render: ( { item }: { item: Site } ) => {
			if ( item.protect === 'enabled' ) {
				return <Icon icon={ check } />;
			}

			return __( 'Disabled' );
		},
		elements: [
			{ value: 'enabled', label: __( 'Enabled' ) },
			{ value: 'disabled', label: __( 'Disabled' ) },
		],
	},
	{
		id: 'preview',
		label: __( 'Preview' ),
		render: function PreviewRender( { item }: { item: Site } ) {
			const [ resizeListener, { width } ] = useResizeObserver();
			const { options, url } = item;
			const { blog_public } = options;
			return (
				<>
					{ resizeListener }
					{ /* If the site is private, show the preview image, because X-Frame-Options is set to same origin. */ }
					{ blog_public === -1 && (
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
					{ /* If the site is public or coming soon, show the preview iframe. */ }
					{ width && blog_public > -1 && (
						<SitePreview url={ url } scale={ width / 1200 } height={ 1200 } />
					) }
				</>
			);
		},
	},
];

const DEFAULT_LAYOUTS = {
	table: {
		mediaField: 'media',
		fields: [ 'subscribers', 'backups', 'protect' ],
	},
	grid: {
		mediaField: 'preview',
		fields: [],
	},
};

export default function Sites() {
	const navigate = useNavigate();
	const sites = useQuery( sitesQuery() ).data;

	// View config.
	const [ view, setView ] = useState< View >( {
		type: 'table',
		page: 1,
		perPage: 10,
		sort: {
			field: 'name',
			direction: 'asc',
		},
		fields: [ 'subscribers', 'backups', 'protect' ],
		titleField: 'name',
		mediaField: 'media',
		descriptionField: 'url',
	} );

	if ( ! sites ) {
		return;
	}

	const { data: filteredData, paginationInfo } = filterSortAndPaginate( sites, view, fields );

	const onClickItem = ( item: Site ) => {
		navigate( { to: `/sites/${ item.id }` } );
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
