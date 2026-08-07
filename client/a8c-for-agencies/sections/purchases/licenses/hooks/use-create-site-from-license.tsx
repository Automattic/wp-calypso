import page from '@automattic/calypso-router';
import { useCallback, useState } from 'react';
import { A4A_SITES_LINK_NEEDS_SETUP } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useFetchPendingSites from 'calypso/a8c-for-agencies/data/sites/use-fetch-pending-sites';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { findPendingSiteIdByLicenseKey, hasProvisioningSite } from '../lib/pending-sites';
import LicenseSiteConfigurationsModal from '../license-site-configurations-modal';

type CreateSiteFromLicense = {
	onCreateSite: () => void;
	isProvisioning: boolean;
	isLoading: boolean;
	modal: JSX.Element | null;
};

/**
 * Lets an unassigned WordPress.com license be turned into a site without
 * leaving the licenses page, using the same configuration modal the Needs
 * setup page opens. Falls back to that page when the license has no pending
 * site to configure — the modal creates a development site when given no ID.
 */
export default function useCreateSiteFromLicense( licenseKey: string ): CreateSiteFromLicense {
	const dispatch = useDispatch();
	const [ isModalOpen, setIsModalOpen ] = useState( false );

	const { data: pendingSites, isLoading } = useFetchPendingSites();

	const pendingSiteId = findPendingSiteIdByLicenseKey( pendingSites, licenseKey );

	const onCreateSite = useCallback( () => {
		if ( ! pendingSiteId ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_licenses_create_site_redirect_needs_setup', {
					license_key: licenseKey,
				} )
			);
			page( A4A_SITES_LINK_NEEDS_SETUP );
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_licenses_create_site_modal_open', {
				license_key: licenseKey,
			} )
		);
		setIsModalOpen( true );
	}, [ dispatch, licenseKey, pendingSiteId ] );

	return {
		onCreateSite,
		isProvisioning: hasProvisioningSite( pendingSites ),
		isLoading,
		modal:
			isModalOpen && pendingSiteId ? (
				<LicenseSiteConfigurationsModal
					siteId={ pendingSiteId }
					closeModal={ () => setIsModalOpen( false ) }
				/>
			) : null,
	};
}
