import { domainGlueRecordsQuery } from '@automattic/api-queries';
import { isMobile } from '@automattic/viewport';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	domainRoute,
	domainGlueRecordsAddRoute,
	domainGlueRecordsEditRoute,
} from '../../app/router/domains';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import DomainGlueRecordDeleteModal from './delete-modal';
import type { DomainGlueRecord } from '@automattic/api-core';
import type { Action, Field, ViewTable, ViewList, View } from '@wordpress/dataviews';

type GlueRecordsView = ViewTable | ViewList;

const DEFAULT_VIEW: GlueRecordsView = {
	type: isMobile() ? 'list' : 'table',
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
	const navigate = useNavigate();
	const { domainName } = domainRoute.useParams();
	const { data: glueRecordsData, isLoading } = useSuspenseQuery(
		domainGlueRecordsQuery( domainName )
	);

	const actions: Action< DomainGlueRecord >[] = useMemo(
		() => [
			{
				id: 'edit',
				label: __( 'Edit' ),
				callback: ( items ) => {
					const item = items[ 0 ];
					navigate( {
						to: domainGlueRecordsEditRoute.fullPath,
						params: { domainName, nameServer: item?.nameserver },
					} );
				},
			},
			{
				id: 'delete',
				label: __( 'Delete' ),
				RenderModal: ( { items, closeModal } ) => (
					<DomainGlueRecordDeleteModal
						glueRecord={ items[ 0 ] }
						onClose={ closeModal }
						domainName={ domainName }
					/>
				),
			},
		],
		[ domainName, navigate ]
	);

	const fields: Field< DomainGlueRecord >[] = useMemo(
		() => [
			{
				id: 'nameServer',
				label: __( 'Name server' ),
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
				label: __( 'IP address' ),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
				getValue: ( { item } ) => {
					return item.ip_addresses[ 0 ];
				},
			},
		],
		[ domainName ]
	);

	const [ view, setView ] = useState< GlueRecordsView >( DEFAULT_VIEW );

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
					prefix={ <Breadcrumbs length={ 2 } /> }
					actions={
						<RouterLinkButton
							to={ domainGlueRecordsAddRoute.fullPath }
							params={ { domainName } }
							variant="primary"
							__next40pxDefaultSize
						>
							{ __( 'Add glue record' ) }
						</RouterLinkButton>
					}
				/>
			}
		>
			<DataViewsCard>
				<DataViews< DomainGlueRecord >
					data={ filteredData || [] }
					fields={ fields }
					onChangeView={ ( view: View ) => setView( view as GlueRecordsView ) }
					view={ view }
					actions={ actions }
					search
					paginationInfo={ paginationInfo }
					getItemId={ ( item: DomainGlueRecord ) => item.nameserver }
					isLoading={ isLoading }
					defaultLayouts={ DEFAULT_LAYOUTS }
					empty={
						<p>
							{ view.search
								? __( 'No glue records found.' )
								: __( 'No glue records found for this domain.' ) }
						</p>
					}
				/>
			</DataViewsCard>
		</PageLayout>
	);
}

export default DomainGlueRecords;
