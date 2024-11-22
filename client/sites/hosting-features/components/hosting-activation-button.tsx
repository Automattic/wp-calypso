import { FEATURE_SFTP } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Dialog } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

interface HostingActivationButtonProps {
	redirectUrl?: string;
}

export default function HostingActivationButton( { redirectUrl }: HostingActivationButtonProps ) {
	const dispatch = useDispatch();
	const { searchParams } = new URL( document.location.toString() );
	const showActivationModal = searchParams.get( 'activate' ) !== null;
	const [ showEligibility, setShowEligibility ] = useState( showActivationModal );

	const siteId = useSelector( getSelectedSiteId );

	const handleTransfer = ( options: { geo_affinity?: string } ) => {
		dispatch( recordTracksEvent( 'calypso_hosting_features_activate_confirm' ) );
		const params = new URLSearchParams( {
			siteId: String( siteId ),
			redirect_to: addQueryArgs( redirectUrl, {
				hosting_features: 'activated',
			} ),
			feature: FEATURE_SFTP,
			initiate_transfer_context: 'hosting',
			initiate_transfer_geo_affinity: options.geo_affinity || '',
		} );
		page( `/setup/transferring-hosted-site?${ params }` );
	};

	return (
		<>
			<HostingHeroButton
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_hosting_features_activate_click' ) );
					return setShowEligibility( true );
				} }
			>
				{ translate( 'Activate now' ) }
			</HostingHeroButton>

			<Dialog
				additionalClassNames="plugin-details-cta__dialog-content"
				additionalOverlayClassNames="plugin-details-cta__modal-overlay"
				isVisible={ showEligibility }
				onClose={ () => setShowEligibility( false ) }
				showCloseIcon
			>
				<EligibilityWarnings
					className="hosting__activating-warnings"
					onProceed={ handleTransfer }
					backUrl={ redirectUrl }
					showDataCenterPicker
					standaloneProceed
					currentContext="hosting-features"
				/>
			</Dialog>
		</>
	);
}
