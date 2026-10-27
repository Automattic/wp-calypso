import {
	activeAgencyQuery,
	jetpackAgencyLicenseAssignMutation,
	paginatedAgencySitesQuery,
} from '@automattic/api-queries';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Button,
	RadioControl,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { useLocale } from '../../../app/locale';
import { ButtonStack } from '../../../components/button-stack';
import { DataViews, DataViewsCard } from '../../../components/dataviews';
import { formatDate, parseDateAsUTC } from '../../../utils/datetime';
import type { AgencySite } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

// Few enough rows that the modal fits on a laptop screen without scrolling.
const SITES_PER_PAGE = 5;

const CONNECT_USER_HELP_URL =
	'https://agencieshelp.automattic.com/knowledge-base/invite-and-manage-team-members/#limitations-for-the-team-member-role';

const DEFAULT_SITES_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: SITES_PER_PAGE,
	search: '',
	fields: [],
	titleField: 'site',
	layout: { density: 'compact' },
};

interface Props {
	licenseKey: string;
	productName: string;
	issuedAt: string;
	clientEmail?: string;
	closeModal?: () => void;
	onAssigned?: () => void;
}

export default function AssignLicenseModal( {
	licenseKey,
	productName,
	issuedAt,
	clientEmail,
	closeModal,
	onAssigned,
}: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const locale = useLocale();
	const issuedDate = formatDate( parseDateAsUTC( issuedAt ), locale );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;
	const [ view, setView ] = useState< View >( DEFAULT_SITES_VIEW );
	const [ selectedSite, setSelectedSite ] = useState< AgencySite | null >( null );
	// Jetpack Backup and Scan can't be assigned to a multisite.
	const isMultisiteAssignable = ! /^jetpack-(backup|scan)/.test( licenseKey );

	const { data, isLoading, isPlaceholderData } = useQuery( {
		...paginatedAgencySitesQuery(
			{
				search: view.search,
				page: view.page,
				per_page: view.perPage,
				...( isMultisiteAssignable ? {} : { not_multisite: true } ),
			},
			agencyId
		),
		enabled: !! agencyId,
		placeholderData: keepPreviousData,
	} );
	const assign = useMutation( jetpackAgencyLicenseAssignMutation( agencyId ) );

	const sites = data?.sites ?? [];
	const totalItems = data?.total ?? 0;

	const fields = useMemo< Field< AgencySite >[] >(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				type: 'text',
				enableSorting: false,
				enableHiding: false,
				getValue: ( { item } ) => item.url,
				render: ( { item } ) => (
					<RadioControl
						label={ __( 'Select site' ) }
						hideLabelFromVision
						selected={ selectedSite?.blog_id === item.blog_id ? String( item.blog_id ) : '' }
						options={ [ { label: item.url, value: String( item.blog_id ) } ] }
						onChange={ () => setSelectedSite( item ) }
					/>
				),
			},
		],
		[ selectedSite ]
	);

	const handleAssign = () => {
		if ( ! selectedSite ) {
			return;
		}
		recordTracksEvent( 'calypso_a4a_license_list_assign_license_click' );
		assign.mutate(
			{ licenseKey, siteId: selectedSite.blog_id },
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %1$s is the product name, %2$s is the site URL. */
							__( '%1$s has been assigned to %2$s.' ),
							productName,
							selectedSite.url
						),
						{ type: 'snackbar' }
					);
					closeModal?.();
					onAssigned?.();
				},
				onError: ( error: Error & { code?: string } ) => {
					if ( error.code === 'partner_not_connected_to_site' ) {
						createErrorNotice(
							sprintf(
								/* translators: %s is the WordPress.com username of the current user. */
								__( 'Connect your WordPress.com user (%s) as a site admin to continue.' ),
								user?.display_name ?? ''
							),
							{
								type: 'snackbar',
								// Keep it up until dismissed so the link stays reachable.
								explicitDismiss: true,
								actions: [ { label: __( 'How to connect' ), url: CONNECT_USER_HELP_URL } ],
							}
						);
						return;
					}
					createErrorNotice(
						error.message || __( 'Failed to assign the license. Please try again.' ),
						{ type: 'snackbar' }
					);
				},
			}
		);
	};

	return (
		<VStack spacing={ 6 }>
			<VStack spacing={ 1 }>
				<Heading level={ 2 } size={ 15 } weight={ 500 }>
					{ productName }
				</Heading>
				{ issuedDate && (
					<Text variant="muted">
						{ sprintf(
							/* translators: %s is the date the license was issued. */
							__( 'Issued %s' ),
							issuedDate
						) }
					</Text>
				) }
				<Text variant="muted">
					{ sprintf(
						/* translators: %s is the license key. */
						__( 'License key: %s' ),
						licenseKey
					) }
				</Text>
				{ clientEmail && (
					<Text variant="muted">
						{ sprintf(
							/* translators: %s is the email address of the referral's client. */
							__( 'Client: %s' ),
							clientEmail
						) }
					</Text>
				) }
			</VStack>
			<VStack spacing={ 3 }>
				<VStack spacing={ 1 }>
					<Heading level={ 2 } size={ 15 } weight={ 500 }>
						{ __( 'Select a site' ) }
					</Heading>
					<Text variant="muted">
						{ createInterpolateElement(
							__(
								'If you don’t see the site in the list, connect it first via the <a>Sites Dashboard</a>.'
							),
							{ a: <Link to="/sites" /> }
						) }
					</Text>
				</VStack>
				<VStack className="dashboard-marketplace-purchases__site-list" justify="flex-start">
					<DataViewsCard>
						<DataViews< AgencySite >
							data={ sites }
							fields={ fields }
							view={ view }
							onChangeView={ setView }
							getItemId={ ( item ) => String( item.blog_id ) }
							isItemClickable={ () => true }
							onClickItem={ setSelectedSite }
							isLoading={ isLoading }
							isPlaceholderData={ isPlaceholderData }
							paginationInfo={ {
								totalItems,
								totalPages: Math.ceil( totalItems / ( view.perPage ?? SITES_PER_PAGE ) ),
							} }
							defaultLayouts={ { table: {} } }
						>
							{ /* A one-column site list has nothing to filter or configure, so only the search is kept. */ }
							<HStack className="dashboard-marketplace-purchases__site-search" justify="flex-start">
								<DataViews.Search />
							</HStack>
							<DataViews.Layout />
							<DataViews.Pagination />
						</DataViews>
					</DataViewsCard>
				</VStack>
			</VStack>
			<ButtonStack justify="flex-end">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ closeModal }
					disabled={ assign.isPending }
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					disabled={ ! selectedSite || assign.isPending }
					isBusy={ assign.isPending }
					onClick={ handleAssign }
				>
					{ __( 'Assign to selected site' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
