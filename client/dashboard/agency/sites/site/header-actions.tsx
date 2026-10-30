import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button, DropdownMenu, MenuGroup, MenuItem, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { moreVertical, wordpress } from '@wordpress/icons';
import { lazy, Suspense, useState } from 'react';
import { useAnalytics } from '../../../app/analytics';
import {
	agencySiteActivityRoute,
	agencySitesRoute,
	hasAnyCapability,
} from '../../../app/router/agency';
import { PageHeader } from '../../../components/page-header';
import { leaveDashboard } from '../../crossover/store';
import { OWNER_ROLE } from '../../team/constants';
import { canActOnSite, getAdminUrl, isDevSite, isUrlOnlySite } from '../dataviews/site-data';
import { isPressableSite } from '../lib';
import type { AgencySite, Site } from '@automattic/api-core';

const RemoveSiteModal = lazy( () => import( '../remove-site-modal' ) );

export default function AgencySiteHeaderActions( {
	site,
	fullSite,
}: {
	site: AgencySite;
	fullSite: Site;
} ) {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const [ isRemoveModalOpen, setIsRemoveModalOpen ] = useState( false );
	const [ isRemoving, setIsRemoving ] = useState( false );

	const track = ( action: string ) =>
		recordTracksEvent( 'calypso_dashboard_agency_site_overview_action_click', { action } );

	// Honors a custom admin path where the site reports one.
	const adminUrl = ( fullSite.options?.admin_url || getAdminUrl( site ) ).replace( /\/?$/, '/' );
	// wp-admin is reachable even when the agency can't act on the site through
	// the connection, so only the menu depends on it.
	const canUseMenu = canActOnSite( site ) && ! isUrlOnlySite( site );
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
			{ canUseMenu && (
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
								{ isPressableSite( site ) && isAgencyOwner && (
									<MenuItem
										onClick={ () => {
											onClose();
											leaveDashboard( 'pressable', () => track( 'manage-in-pressable' ) );
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
			) }
			{ isRemoveModalOpen && (
				<Modal
					title={ __( 'Remove site' ) }
					// Closing mid-removal would unmount the modal before it can report the
					// result and leave the page.
					isDismissible={ ! isRemoving }
					shouldCloseOnEsc={ ! isRemoving }
					shouldCloseOnClickOutside={ ! isRemoving }
					onRequestClose={ () => setIsRemoveModalOpen( false ) }
				>
					<Suspense fallback={ null }>
						<RemoveSiteModal
							site={ site }
							closeModal={ () => {
								setIsRemoving( false );
								setIsRemoveModalOpen( false );
							} }
							onRemovingChange={ setIsRemoving }
							onRemoved={ () => navigate( { to: agencySitesRoute.fullPath } ) }
						/>
					</Suspense>
				</Modal>
			) }
		</>
	);
}
