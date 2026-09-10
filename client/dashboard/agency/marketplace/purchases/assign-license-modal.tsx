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
import { ButtonStack } from '../../../components/button-stack';
import { DataViews } from '../../../components/dataviews';
import { getLicenseProductName } from './license-status';
import type { AgencySite, JetpackLicense } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

const SITES_PER_PAGE = 10;

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
	license: JetpackLicense;
	closeModal?: () => void;
}

export default function AssignLicenseModal( { license, closeModal }: Props ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;
	const [ view, setView ] = useState< View >( DEFAULT_SITES_VIEW );
	const [ selectedSite, setSelectedSite ] = useState< AgencySite | null >( null );

	const { data, isLoading, isPlaceholderData } = useQuery( {
		...paginatedAgencySitesQuery(
			{ search: view.search, page: view.page, per_page: view.perPage },
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
			{ licenseKey: license.license_key, siteId: selectedSite.blog_id },
			{
				onSuccess: () => {
					createSuccessNotice(
						sprintf(
							/* translators: %1$s is the product name, %2$s is the site URL. */
							__( '%1$s has been assigned to %2$s.' ),
							getLicenseProductName( license ),
							selectedSite.url
						),
						{ type: 'snackbar' }
					);
					closeModal?.();
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
			<Text>
				{ createInterpolateElement(
					__(
						'If you don’t see the site in the list, connect it first via the <a>Sites Dashboard</a>.'
					),
					{ a: <Link to="/sites" /> }
				) }
			</Text>
			<div className="dashboard-marketplace-purchases__site-picker">
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
						totalPages: Math.ceil( totalItems / SITES_PER_PAGE ),
					} }
					defaultLayouts={ { table: {} } }
				/>
			</div>
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
