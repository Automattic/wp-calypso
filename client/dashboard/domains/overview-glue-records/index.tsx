import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { domainGlueRecordsQuery } from '../../app/queries/domain-glue-records';
import {
	domainRoute,
	domainGlueRecordsAddRoute,
	domainGlueRecordsEditRoute,
} from '../../app/router';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import type { DomainGlueRecord } from '../../data/domain-glue-records';
import type { Action, Field, ViewTable, ViewList, View } from '@wordpress/dataviews';

type ForwardingView = ViewTable | ViewList;

const DEFAULT_VIEW: ForwardingView = {
	type: 'table',
	search: '',
	page: 1,
	perPage: 20,
	titleField: 'nameServer',
	sort: {
		field: 'nameServer',
		direction: 'asc',
	},
	fields: [ 'ipAddress' ],
	filters: [],
};

const DEFAULT_LAYOUTS = {
	table: {},
	list: {},
};

function DomainGlueRecords() {
	const router = useRouter();

	const { domainName } = domainRoute.useParams();
	const { data: glueRecordsData, isLoading } = useQuery( domainGlueRecordsQuery( domainName ) );

	const actions: Action< DomainGlueRecord >[] = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit' ),
				callback: ( items ) => {
					const item = items[ 0 ];
					router.navigate( {
						to: domainGlueRecordsEditRoute.fullPath,
						params: { domainName, nameServer: item?.nameserver },
					} );
				},
			},
		],
		[]
	);

	const fields: Field< DomainGlueRecord >[] = useMemo(
		() => [
			{
				id: 'nameServer',
				label: __( 'Name Server' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item } ) => {
					return item.nameserver;
				},
				render: ( { field, item } ) => (
					<Link
						to={ domainGlueRecordsEditRoute.fullPath }
						params={ { domainName, nameServer: item.nameserver } }
					>
						{ field.getValue( { item } ) }
					</Link>
				),
			},
			{
				id: 'ipAddress',
				label: __( 'IP Address' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item } ) => {
					return item.ip_addresses[ 0 ];
				},
			},
		],
		[]
	);

	const [ view, setView ] = useState< ForwardingView >( DEFAULT_VIEW );

	const { data: filteredData, paginationInfo } = filterSortAndPaginate(
		glueRecordsData ?? [],
		view,
		fields
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					title={ __( 'Glue Records' ) }
					actions={
						<RouterLinkButton
							to={ domainGlueRecordsAddRoute.fullPath }
							params={ { domainName } }
							variant="primary"
							__next40pxDefaultSize
						>
							{ __( 'Add Glue Records' ) }
						</RouterLinkButton>
					}
				/>
			}
		>
			<DataViewsCard>
				{ glueRecordsData?.length === 0 && ! isLoading ? (
					<div style={ { padding: '20px', textAlign: 'center' } }>
						{ __( 'No glue records found for this domain.' ) }
					</div>
				) : (
					<DataViews< DomainGlueRecord >
						data={ filteredData || [] }
						fields={ fields }
						onChangeView={ ( view: View ) => setView( view as ForwardingView ) }
						view={ view }
						actions={ actions }
						search
						paginationInfo={ paginationInfo }
						getItemId={ ( item: DomainGlueRecord ) => item.nameserver }
						isLoading={ isLoading }
						defaultLayouts={ DEFAULT_LAYOUTS }
					/>
				) }
			</DataViewsCard>
		</PageLayout>
	);
}

export default DomainGlueRecords;
