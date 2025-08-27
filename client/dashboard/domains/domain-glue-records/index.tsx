import { isMobile } from '@automattic/viewport';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import {
	domainGlueRecordDeleteMutation,
	domainGlueRecordsQuery,
} from '../../app/queries/domain-glue-records';
import {
	domainRoute,
	domainGlueRecordsAddRoute,
	domainGlueRecordsEditRoute,
} from '../../app/router/domains';
import DataViewsCard from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import RouterLinkButton from '../../components/router-link-button';
import type { DomainGlueRecord } from '../../data/domain-glue-records';
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
	const deleteMutation = useMutation( domainGlueRecordDeleteMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState( false );
	const [ selectedGlueRecord, setSelectedGlueRecord ] = useState< DomainGlueRecord | undefined >();

	const openDeleteDialog = ( glueRecord: DomainGlueRecord ) => {
		setIsDeleteDialogOpen( true );
		setSelectedGlueRecord( glueRecord );
	};

	const closeDeleteDialog = () => {
		setIsDeleteDialogOpen( false );
		setSelectedGlueRecord( undefined );
	};

	const onDeleteDialogConfirm = () => {
		if ( selectedGlueRecord ) {
			deleteMutation.mutate( selectedGlueRecord, {
				onSuccess: () => {
					createSuccessNotice( __( 'Glue record was deleted successfully.' ), {
						type: 'snackbar',
					} );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to delete glue record.' ), {
						type: 'snackbar',
					} );
				},
			} );
		}

		closeDeleteDialog();
	};

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
				callback: ( items ) => {
					const item = items[ 0 ];

					openDeleteDialog( item );
				},
			},
		],
		[ domainName, navigate ]
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
					title={ __( 'Glue records' ) }
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
				{ glueRecordsData?.length === 0 && ! isLoading ? (
					<div style={ { padding: '20px', textAlign: 'center' } }>
						{ __( 'No glue records found for this domain.' ) }
					</div>
				) : (
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
					/>
				) }
			</DataViewsCard>

			<ConfirmDialog
				isOpen={ isDeleteDialogOpen }
				onConfirm={ onDeleteDialogConfirm }
				onCancel={ closeDeleteDialog }
				confirmButtonText={ __( 'Delete' ) }
			>
				{ __( 'Are you sure you want to delete this record?' ) }
			</ConfirmDialog>
		</PageLayout>
	);
}

export default DomainGlueRecords;
