import { domainForwardingQuery, domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	domainRoute,
	domainForwardingAddRoute,
	domainForwardingEditRoute,
} from '../../app/router/domains';
import { DataViewsCard } from '../../components/dataviews';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import DomainForwardingDeleteModal from './delete-modal';
import { DomainForwardingNotice } from './notice';
import type { DomainForwarding as DomainForwardingType } from '@automattic/api-core';
import type { Action, Field, ViewTable, ViewList, View } from '@wordpress/dataviews';

function getForwardingId( forwarding: DomainForwardingType ) {
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

function DomainForwarding() {
	const router = useRouter();

	const { domainName } = domainRoute.useParams();
	const { data: domainData } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: forwardingData } = useSuspenseQuery( domainForwardingQuery( domainName ) );

	const actions: Action< DomainForwardingType >[] = useMemo(
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
				RenderModal: ( { items, closeModal } ) => (
					<DomainForwardingDeleteModal
						domainName={ domainName }
						domainForwarding={ items[ 0 ] }
						onClose={ closeModal }
					/>
				),
			},
		],
		[ domainName, router ]
	);

	const fields: Field< DomainForwardingType >[] = useMemo(
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
				label: __( 'Path forwarding' ),
				enableHiding: true,
				enableSorting: true,
				enableGlobalSearch: false,
				getValue: ( { item } ) => {
					return item.forward_paths ? __( 'Yes' ) : __( 'No' );
				},
			},
			{
				id: 'is_permanent',
				label: __( 'Redirect type' ),
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
					prefix={ <Breadcrumbs length={ 2 } /> }
					description={ createInterpolateElement(
						__( 'Forward your domain or subdomain to another address. <learnMoreLink />' ),
						{
							learnMoreLink: <InlineSupportLink supportContext="domain-forwarding" />,
						}
					) }
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
			<DomainForwardingNotice domainName={ domainName } domainData={ domainData } />
			<DataViewsCard>
				<DataViews< DomainForwardingType >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( view: View ) => setView( view as ForwardingView ) }
					view={ view }
					actions={ actions }
					search
					paginationInfo={ paginationInfo }
					getItemId={ getForwardingId }
					defaultLayouts={ DEFAULT_LAYOUTS }
					empty={ <p>{ __( 'No forwarding rules found for this domain.' ) }</p> }
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default DomainForwarding;
