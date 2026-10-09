import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, DropdownMenu, MenuGroup, MenuItem, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical, wordpress } from '@wordpress/icons';
import { lazy, Suspense, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { agencySiteActivityRoute, hasAnyCapability } from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import { OWNER_ROLE } from '../../team/constants';
import { canActOnSite, getAdminUrl, isDevSite, isUrlOnlySite } from '../dataviews/site-data';
import type { AgencySite } from '@automattic/api-core';

const RemoveSiteModal = lazy( () => import( '../remove-site-modal' ) );

// Pressable has no per-site link yet, so this opens the agency's dashboard.
const PRESSABLE_AGENCY_URL = 'https://my.pressable.com/agency/auth';

export default function AgencySiteHeaderActions( { site }: { site: AgencySite } ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const [ isRemoveModalOpen, setIsRemoveModalOpen ] = useState( false );

	if ( ! canActOnSite( site ) || isUrlOnlySite( site ) ) {
		return null;
	}

	const track = ( action: string ) =>
		recordTracksEvent( 'calypso_dashboard_agency_site_overview_action_click', { action } );

	const adminUrl = getAdminUrl( site );
	const isPressableSite = site.hosting_provider_guess === 'pressable';
	// Only the agency owner can sign in to the Pressable account.
	const isAgencyOwner = agency?.user?.role === OWNER_ROLE;
	// Removal keys off the agency's own site id, which a site still being set up
	// has not been given yet.
	const canRemoveSite =
		hasAnyCapability( agency?.user?.capabilities ?? [], 'a4a_remove_managed_sites' ) &&
		! isDevSite( site ) &&
		!! site.a4a_site_id;

	return (
		<>
			<Button
				__next40pxDefaultSize
				variant="primary"
				href={ adminUrl }
				icon={ wordpress }
				onClick={ () => track( 'wp-admin' ) }
			>
				{ __( 'WP Admin' ) }
			</Button>
			<PageHeader.ActionMenu>
				<DropdownMenu icon={ moreVertical } label={ __( 'Quick actions' ) }>
					{ ( { onClose } ) => (
						<MenuGroup>
							<MenuItem
								onClick={ () => {
									track( 'settings' );
									window.open(
										`${ adminUrl }options-general.php`,
										'_blank',
										'noreferrer,noopener'
									);
								} }
							>
								{ __( 'Settings ↗' ) }
							</MenuItem>
							<MenuItem
								onClick={ () => {
									track( 'view-activity' );
									navigate( {
										to: agencySiteActivityRoute.fullPath,
										params: { siteSlug: site.url },
									} );
								} }
							>
								{ __( 'View activity' ) }
							</MenuItem>
							{ isPressableSite && isAgencyOwner && (
								<MenuItem
									onClick={ () => {
										track( 'manage-in-pressable' );
										window.open( PRESSABLE_AGENCY_URL, '_blank', 'noreferrer,noopener' );
									} }
								>
									{ __( 'Manage in Pressable ↗' ) }
								</MenuItem>
							) }
							{ canRemoveSite && (
								<MenuItem
									isDestructive
									onClick={ () => {
										track( 'remove-site' );
										onClose();
										setIsRemoveModalOpen( true );
									} }
								>
									{ __( 'Remove site' ) }
								</MenuItem>
							) }
						</MenuGroup>
					) }
				</DropdownMenu>
			</PageHeader.ActionMenu>
			{ isRemoveModalOpen && (
				<Modal title={ __( 'Remove site' ) } onRequestClose={ () => setIsRemoveModalOpen( false ) }>
					<Suspense fallback={ null }>
						<RemoveSiteModal
							site={ site }
							closeModal={ () => setIsRemoveModalOpen( false ) }
							onRemoved={ () => navigate( { to: '/sites' } ) }
						/>
					</Suspense>
				</Modal>
			) }
		</>
	);
}
