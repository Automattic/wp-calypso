import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import {
	domainForwardingDeleteMutation,
	domainForwardingQuery,
} from '../../app/queries/domain-forwarding';
import {
	domainRoute,
	domainForwardingAddRoute,
	domainForwardingEditRoute,
} from '../../app/router/domains';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import type { DomainForwarding } from '../../data/domain-forwarding';
import type { Action, Field, ViewTable, ViewList, View } from '@wordpress/dataviews';

function getForwardingId( forwarding: DomainForwarding ) {
	return `${ forwarding.domain_redirect_id }-${ forwarding.domain }`;
}

type ForwardingView = ViewTable | ViewList;

const DEFAULT_VIEW: ForwardingView = {
	type: 'table',
	search: '',
	page: 1,
	perPage: 20,
	titleField: 'source',
	sort: {
		field: 'source',
		direction: 'asc',
	},
	fields: [ 'destination' ],
	filters: [],
};

const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};

function DomainForwardings() {
	const router = useRouter();

	const { domainName } = domainRoute.useParams();
	const { data: forwardingData } = useSuspenseQuery( domainForwardingQuery( domainName ) );
	const deleteMutation = useMutation( domainForwardingDeleteMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const actions: Action< DomainForwarding >[] = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit' ),
				callback: ( items ) => {
					const item = items[ 0 ];
					router.navigate( {
						to: domainForwardingEditRoute.fullPath,
						params: { domainName, forwardingId: item?.domain_redirect_id },
					} );
				},
			},
			{
				id: 'delete',
				label: __( 'Delete' ),
				callback: ( items ) => {
					const item = items[ 0 ];
					deleteMutation.mutate( item.domain_redirect_id, {
						onSuccess: () => {
							createSuccessNotice( __( 'Domain forwarding rule was deleted successfully.' ), {
								type: 'snackbar',
							} );
						},
						onError: () => {
							createErrorNotice( __( 'Failed to delete domain forwarding rule.' ), {
								type: 'snackbar',
							} );
						},
					} );
				},
			},
		],
		[ createErrorNotice, createSuccessNotice, deleteMutation, domainName, router ]
	);

	const fields: Field< DomainForwarding >[] = useMemo(
		() => [
			{
				id: 'source',
				label: __( 'Source URL' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item } ) => {
					// Create full source URL
					const fqdn = item.fqdn || '';
					const sourcePath = item.source_path || '';
					return `${ fqdn }${ sourcePath }`;
				},
				render: ( { field, item } ) => (
					<Link
						to={ domainForwardingEditRoute.fullPath }
						params={ { domainName, forwardingId: item.domain_redirect_id } }
					>
						{ field.getValue( { item } ) }
					</Link>
				),
			},
			{
				id: 'destination',
				label: __( 'Destination URL' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item } ) => {
					const protocol = item.is_secure ? 'https://' : 'http://';
					const targetPath = item.target_path || '';
					return `${ protocol }${ item.target_host }${ targetPath }`;
				},
			},
			{
				id: 'forward_paths',
				label: __( 'Path Forwarding' ),
				enableHiding: true,
				enableSorting: true,
				enableGlobalSearch: false,
				getValue: ( { item } ) => {
					return item.forward_paths ? __( 'Yes' ) : __( 'No' );
				},
			},
			{
				id: 'is_permanent',
				label: __( 'Redirect Type' ),
				enableHiding: true,
				enableSorting: true,
				enableGlobalSearch: false,
				getValue: ( { item } ) => {
					return item.is_permanent ? __( 'Permanent (301)' ) : __( 'Temporary (307)' );
				},
			},
		],
		[ domainName ]
	);

	const [ view, setView ] = useState< ForwardingView >( DEFAULT_VIEW );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		forwardingData ?? [],
		view,
		fields
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Domain Forwarding' ) }
					actions={
						<RouterLinkButton
							to={ domainForwardingAddRoute.fullPath }
							params={ { domainName } }
							variant="primary"
							__next40pxDefaultSize
						>
							{ __( 'Add Domain Forwarding' ) }
						</RouterLinkButton>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews< DomainForwarding >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( view: View ) => setView( view as ForwardingView ) }
					view={ view }
					actions={ actions }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getForwardingId }
					defaultLayouts={ DEFAULT_LAYOUTS }
					empty={ __( 'No forwarding rules found for this domain.' ) }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default DomainForwardings;
