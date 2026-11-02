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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { useAuth } from '../../../app/auth';
import { useLocale } from '../../../app/locale';
import { ButtonStack } from '../../../components/button-stack';
import { DataViews, DataViewsCard } from '../../../components/dataviews';
import InlineSupportLink from '../../../components/inline-support-link';
import Notice from '../../../components/notice';
import { formatDate, parseDateAsUTC } from '../../../utils/datetime';
import { openWooDownload } from './woo-download/store';
import type { AgencySite } from '@automattic/api-core';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

// Few enough rows that the modal fits on a laptop screen without scrolling.
const SITES_PER_PAGE = 5;

// Both guides explain that the agency owner must be a connected admin on the site.
const ASSIGN_JETPACK_HELP_URL =
	'https://agencieshelp.automattic.com/knowledge-base/assign-a-jetpack-plugin-to-a-site/';
const ASSIGN_WOOCOMMERCE_HELP_URL =
	'https://agencieshelp.automattic.com/knowledge-base/assign-a-woocommerce-extension-to-a-site/';

// The WooCommerce.com connection screen; it also lists the store's WooCommerce.com subscriptions.
const WOOCOMMERCE_CONNECT_PATH = '/wp-admin/admin.php?page=wc-addons&section=helper';
const WOOCOMMERCE_INSTALL_PATH = '/wp-admin/plugin-install.php?s=woocommerce&tab=search&type=term';

type AssignError = 'user-not-connected' | 'woocommerce-not-installed' | 'woocommerce-not-connected';

const getSiteUrl = ( site: AgencySite ) =>
	( site.url_with_scheme ?? `https://${ site.url }` ).replace( /\/$/, '' );

const DEFAULT_SITES_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: SITES_PER_PAGE,
	search: '',
	fields: [],
	titleField: 'site',
	layout: { density: 'compact' },
};

interface AssignLicenseModalProps {
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
}: AssignLicenseModalProps ) {
	const { recordTracksEvent } = useAnalytics();
	const { user } = useAuth();
	const locale = useLocale();
	const issuedDate = formatDate( parseDateAsUTC( issuedAt ), locale );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;
	const [ view, setView ] = useState< View >( DEFAULT_SITES_VIEW );
	const [ selectedSite, setSelectedSite ] = useState< AgencySite | null >( null );
	const [ assignError, setAssignError ] = useState< AssignError | null >( null );
	const errorRef = useRef< HTMLDivElement >( null );

	// The error sits above the site list, out of view once the modal is scrolled to its buttons.
	useEffect( () => {
		if ( assignError ) {
			errorRef.current?.scrollIntoView( { block: 'start', behavior: 'smooth' } );
		}
	}, [ assignError ] );
	// Jetpack Backup and Scan can't be assigned to a multisite.
	const isMultisiteAssignable = ! /^jetpack-(backup|scan)/.test( licenseKey );
	const isWooExtension = licenseKey.startsWith( 'woocommerce' );

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

	const selectSite = useCallback( ( site: AgencySite ) => {
		setSelectedSite( site );
		setAssignError( null );
	}, [] );

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
						onChange={ () => selectSite( item ) }
					/>
				),
			},
		],
		[ selectedSite, selectSite ]
	);

	const handleAssign = () => {
		if ( ! selectedSite ) {
			return;
		}
		setAssignError( null );
		recordTracksEvent( 'calypso_a4a_license_list_assign_license_click' );
		assign.mutate(
			{ licenseKey, siteId: selectedSite.blog_id },
			{
				onSuccess: () => {
					if ( isWooExtension ) {
						closeModal?.();
						openWooDownload( {
							licenseKey,
							productName,
							siteUrl: selectedSite.url,
							onClose: onAssigned,
						} );
						return;
					}
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
						setAssignError( 'user-not-connected' );
						return;
					}
					// Woo extensions only provision on a store that runs WooCommerce and is
					// connected to WooCommerce.com, which a Jetpack connection doesn't cover.
					if (
						isWooExtension &&
						/provision|woocommerce/i.test( `${ error.code ?? '' } ${ error.message }` )
					) {
						// The API only says why in the message: the store isn't connected to
						// WooCommerce.com, or (otherwise) WooCommerce isn't there to provision on.
						setAssignError(
							/connect/i.test( error.message )
								? 'woocommerce-not-connected'
								: 'woocommerce-not-installed'
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

	const errorSiteUrl = selectedSite ? getSiteUrl( selectedSite ) : '';

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
			{ assignError === 'woocommerce-not-installed' && (
				<Notice
					ref={ errorRef }
					variant="error"
					title={ __( 'WooCommerce isn’t installed' ) }
					actions={
						<Button
							variant="secondary"
							href={ errorSiteUrl + WOOCOMMERCE_INSTALL_PATH }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () =>
								recordTracksEvent( 'calypso_a4a_license_assign_woocommerce_install_click' )
							}
						>
							{ __( 'Install WooCommerce' ) }
						</Button>
					}
				>
					{ sprintf(
						/* translators: %1$s is the product name, %2$s is the site URL. */
						__(
							'%1$s needs WooCommerce. Install and activate WooCommerce on %2$s, then try again.'
						),
						productName,
						selectedSite?.url ?? ''
					) }
				</Notice>
			) }
			{ assignError === 'user-not-connected' && (
				<Notice
					ref={ errorRef }
					variant="error"
					title={ __( 'You’re not connected to this site' ) }
				>
					{ createInterpolateElement(
						__(
							'Connect your WordPress.com user (<username />) as an admin on <site />, then try again. <a>How to connect</a>'
						),
						{
							username: <>{ user?.display_name }</>,
							site: <>{ selectedSite?.url }</>,
							a: (
								<InlineSupportLink
									supportLink={
										isWooExtension ? ASSIGN_WOOCOMMERCE_HELP_URL : ASSIGN_JETPACK_HELP_URL
									}
									forceOpenInHelpCenter
								/>
							),
						}
					) }
				</Notice>
			) }
			{ assignError === 'woocommerce-not-connected' && (
				<Notice
					ref={ errorRef }
					variant="error"
					title={ __( 'Store isn’t connected to WooCommerce.com' ) }
					actions={
						<Button
							variant="secondary"
							href={ errorSiteUrl + WOOCOMMERCE_CONNECT_PATH }
							target="_blank"
							rel="noopener noreferrer"
							onClick={ () =>
								recordTracksEvent( 'calypso_a4a_license_assign_woocommerce_connect_click' )
							}
						>
							{ __( 'Connect to WooCommerce.com' ) }
						</Button>
					}
				>
					{ sprintf(
						/* translators: %1$s is the product name, %2$s is the site URL. */
						__(
							'%1$s can only be assigned to a store connected to WooCommerce.com. Connect %2$s, then try again.'
						),
						productName,
						selectedSite?.url ?? ''
					) }
				</Notice>
			) }
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
							onClickItem={ selectSite }
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
