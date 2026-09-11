import {
	activeAgencyQuery,
	agencyManagedSiteIdsQuery,
	agencySitesImportMutation,
	agencySitesQueryKey,
	allSitesQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Modal,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViewsPicker, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, _n, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useIntlLocale } from '../../../app/locale';
import { ButtonStack } from '../../../components/button-stack';
import { DataViewsCard, DataViewsEmptyStateLayout } from '../../../components/dataviews';
import SiteIcon from '../../../components/site-icon';
import { Name, URL } from '../../../sites/site-fields';
import { getSiteDisplayName } from '../../../utils/site-name';
import { getSiteDisplayUrl } from '../../../utils/site-url';
import { getImportableSites } from './lib';
import type { Site } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

const DEFAULT_VIEW: View = {
	type: 'pickerTable',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
	fields: [ 'date', 'type' ],
	titleField: 'name',
	descriptionField: 'url',
	mediaField: 'icon',
	showMedia: true,
};

function getSiteTypeLabel( site: Site ): string {
	if ( site.is_wpcom_atomic ) {
		return __( 'WordPress.com' );
	}
	if ( site.is_a4a_client ) {
		return __( 'Automattic for Agencies' );
	}
	if ( site.jetpack ) {
		return __( 'Jetpack' );
	}
	return '';
}

function formatCreatedAt( site: Site, locale: string ): string {
	const createdAt = site.options?.created_at;

	if ( ! createdAt ) {
		return '';
	}

	const date = new Date( createdAt );
	return Number.isNaN( date.getTime() ) ? '' : new Intl.DateTimeFormat( locale ).format( date );
}

function getImportNotice( importedCount: number, failedCount: number ): string {
	if ( failedCount ) {
		return sprintf(
			/* translators: %1$d is the number of sites added, %2$d the number selected. */
			__( 'Only %1$d of %2$d sites could be added. Please try the rest again.' ),
			importedCount,
			importedCount + failedCount
		);
	}

	return sprintf(
		/* translators: %d is the number of sites added. */
		_n(
			'%d site has been successfully added.',
			'%d sites have been successfully added.',
			importedCount
		),
		importedCount
	);
}

interface ImportFromWPCOMModalProps {
	onClose: () => void;
}

/**
 * Brings sites the user already owns on WordPress.com, or has connected with
 * Jetpack or the A4A plugin, under the agency's management.
 */
export default function ImportFromWPCOMModal( { onClose }: ImportFromWPCOMModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const queryClient = useQueryClient();
	const locale = useIntlLocale();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const { data: agency, isLoading: isLoadingAgency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: sites, isLoading: isLoadingSites } = useQuery( allSitesQuery() );
	const { data: managedSiteIds, isLoading: isLoadingManagedSites } = useQuery( {
		...agencyManagedSiteIdsQuery( agencyId ),
		enabled: !! agencyId,
	} );

	const [ selection, setSelection ] = useState< string[] >( [] );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );

	const importSites = useMutation( agencySitesImportMutation( agencyId ) );

	const fields: Field< Site >[] = useMemo(
		() => [
			{
				id: 'name',
				label: __( 'Site' ),
				enableGlobalSearch: true,
				getValue: ( { item } ) => getSiteDisplayName( item ),
				render: ( { field, item } ) => <Name site={ item } value={ field.getValue( { item } ) } />,
			},
			{
				id: 'url',
				label: __( 'URL' ),
				enableGlobalSearch: true,
				getValue: ( { item } ) => getSiteDisplayUrl( item ),
				render: ( { field, item } ) => <URL site={ item } value={ field.getValue( { item } ) } />,
			},
			{
				id: 'icon',
				label: __( 'Site icon' ),
				render: ( { item } ) => <SiteIcon site={ item } />,
				enableSorting: false,
			},
			{
				id: 'date',
				label: __( 'Date' ),
				getValue: ( { item } ) => item.options?.created_at ?? '',
				render: ( { item } ) => <Text>{ formatCreatedAt( item, locale ) }</Text>,
			},
			{
				id: 'type',
				label: __( 'Type' ),
				getValue: ( { item } ) => getSiteTypeLabel( item ),
			},
		],
		[ locale ]
	);

	// A site the agency already manages must never appear as selectable, so the
	// rows stay hidden until that list has arrived (or failed).
	const isLoading = isLoadingSites || isLoadingAgency || ( !! agencyId && isLoadingManagedSites );

	const importableSites = useMemo(
		() => ( isLoading ? [] : getImportableSites( sites, managedSiteIds ) ),
		[ isLoading, sites, managedSiteIds ]
	);

	const { data: shownSites, paginationInfo } = useMemo(
		() => filterSortAndPaginate( importableSites, view, fields ),
		[ importableSites, view, fields ]
	);

	const handleAddSites = () => {
		const blogIds = selection.map( Number );

		recordTracksEvent( 'calypso_dashboard_agency_sites_import_wpcom_sites_click', {
			site_count: blogIds.length,
		} );

		importSites.mutate( blogIds, {
			onSuccess: ( { imported, failed } ) => {
				// A4A runs on Calypso's QueryClient, so the refresh belongs here
				// rather than in the mutation factory.
				queryClient.invalidateQueries( { queryKey: agencySitesQueryKey } );

				const notice = getImportNotice( imported.length, failed.length );
				const createNotice = failed.length ? createErrorNotice : createSuccessNotice;
				createNotice( notice, { type: 'snackbar' } );

				onClose();
			},
			onError: () =>
				createErrorNotice( __( 'Something went wrong. Please try again.' ), {
					type: 'snackbar',
				} ),
		} );
	};

	return (
		<Modal
			title={ __( 'Add sites via WordPress.com connection' ) }
			onRequestClose={ onClose }
			size="large"
		>
			<VStack spacing={ 4 }>
				<Text variant="muted" as="p">
					{ __(
						'Add one or more sites you previously created on WordPress.com or connected with Jetpack.'
					) }
				</Text>
				<DataViewsCard>
					<DataViewsPicker< Site >
						data={ shownSites }
						fields={ fields }
						view={ view }
						onChangeView={ setView }
						selection={ selection }
						onChangeSelection={ setSelection }
						getItemId={ ( item ) => String( item.ID ) }
						isLoading={ isLoading }
						paginationInfo={ paginationInfo }
						defaultLayouts={ { pickerTable: {} } }
						// The picker only offers multi-selection when every action it is
						// given supports bulk, so this action is what turns the row
						// checkboxes and select-all on.
						actions={ [
							{
								id: 'add-sites',
								label: __( 'Add sites' ),
								supportsBulk: true,
								callback: handleAddSites,
							},
						] }
						empty={
							<DataViewsEmptyStateLayout
								title={ __( 'No sites to add' ) }
								description={ __( 'Every site you can add is already managed by your agency.' ) }
							/>
						}
					>
						{ /* Composed by hand to leave out the picker's own footer, which
						     would repeat the modal's Add button below. */ }
						<HStack className="dataviews__view-actions" alignment="top" justify="space-between">
							<HStack className="dataviews__search" justify="flex-start">
								<DataViewsPicker.Search />
							</HStack>
						</HStack>
						<DataViewsPicker.Layout />
						<DataViewsPicker.Pagination />
					</DataViewsPicker>
				</DataViewsCard>
				<ButtonStack justify="flex-end">
					<Button variant="tertiary" __next40pxDefaultSize onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button
						variant="primary"
						__next40pxDefaultSize
						disabled={ selection.length === 0 || importSites.isPending }
						isBusy={ importSites.isPending }
						onClick={ handleAddSites }
					>
						{ selection.length > 0
							? sprintf(
									/* translators: %d is the number of sites selected. */
									_n( 'Add %d site', 'Add %d sites', selection.length ),
									selection.length
							  )
							: __( 'Add sites' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</Modal>
	);
}
