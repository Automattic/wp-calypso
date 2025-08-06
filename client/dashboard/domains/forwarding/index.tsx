import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { domainForwardingQuery } from '../../app/queries/domain-forwarding';
import { domainRoute } from '../../app/router';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { DomainForwardingObject } from '../../data/domain-forwarding';
import type { Field, ViewTable, ViewList, View } from '@wordpress/dataviews';

function getForwardingId( forwarding: DomainForwardingObject ) {
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
	const { domainName } = domainRoute.useParams();
	const { data: forwardingData, isLoading } = useSuspenseQuery(
		domainForwardingQuery( domainName )
	);

	const fields: Field< DomainForwardingObject >[] = useMemo(
		() => [
			{
				id: 'source',
				label: __( 'Source URL' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item }: { item: DomainForwardingObject } ) => {
					// Create full source URL
					const fqdn = item.fqdn || '';
					const sourcePath = item.source_path || '';
					return `${ fqdn }${ sourcePath }`;
				},
			},
			{
				id: 'destination',
				label: __( 'Destination URL' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item }: { item: DomainForwardingObject } ) => {
					const protocol = item.is_secure ? 'https://' : 'http://';
					const targetPath = item.target_path || '';
					return `${ protocol }${ item.target_host }${ targetPath }`;
				},
			},
		],
		[]
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
						<>
							<Button variant="primary" __next40pxDefaultSize>
								{ __( 'Add Domain Forwarding' ) }
							</Button>
						</>
					}
				/>
			}
		>
			<DataViewsCard>
				{ forwardingData?.length === 0 && ! isLoading ? (
					<div style={ { padding: '20px', textAlign: 'center' } }>
						{ __( 'No forwarding rules found for this domain.' ) }
					</div>
				) : (
					<DataViews< DomainForwardingObject >
						data={ filteredData || [] }
						fields={ fields }
						onChangeView={ ( view: View ) => setView( view ) }
						view={ view }
						search
						paginationInfo={ paginationInfo }
						getItemId={ getForwardingId }
						isLoading={ isLoading }
						defaultLayouts={ DEFAULT_LAYOUTS }
					/>
				) }
			</DataViewsCard>
		</PageLayout>
	);
}

export default DomainForwarding;
