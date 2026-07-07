import { FEATURE_SFTP } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Modal } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import { HostingHeroButton } from 'calypso/components/hosting-hero';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getEligibility,
	isEligibleForAutomatedTransfer,
} from 'calypso/state/automated-transfer/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ComponentProps } from 'react';

interface HostingActivationButtonProps {
	path?: string;
	redirectUrl?: string;
}

export default function HostingActivationButton( {
	text,
	path = '',
	redirectUrl,
	...props
}: HostingActivationButtonProps & ComponentProps< typeof Button > ) {
	const dispatch = useDispatch();
	const { searchParams } = new URL( document.location.toString() );
	const showActivationModal = searchParams.get( 'activate' ) !== null;
	const [ showEligibility, setShowEligibility ] = useState( showActivationModal );

	const siteId = useSelector( getSelectedSiteId );
	const hasSftpFeature = useSelector( ( state ) => siteHasFeature( state, siteId, FEATURE_SFTP ) );

	// Resolve eligibility up front so a click can skip the modal when there is
	// nothing to surface. A cleanly eligible site starts the transfer directly,
	// using the optimal (default) data center.
	const eligibility = useSelector( ( state ) => getEligibility( state, siteId ) );
	const isEligible = useSelector( ( state ) => isEligibleForAutomatedTransfer( state, siteId ) );
	const canStartTransferDirectly =
		!! eligibility.lastUpdate &&
		isEligible &&
		( eligibility.eligibilityHolds?.length ?? 0 ) === 0 &&
		( eligibility.eligibilityWarnings?.length ?? 0 ) === 0;

	const handleTransfer = ( options: { geo_affinity?: string } ) => {
		dispatch( recordTracksEvent( 'calypso_hosting_features_activate_confirm' ) );

		// Additional event to align analysis across dashboards.
		// See: https://wp.me/pgz0xU-qp
		dispatch(
			recordTracksEvent( 'calypso_dashboard_hosting_feature_activation_confirm', {
				path,
			} )
		);

		const params = new URLSearchParams( {
			siteId: String( siteId ),
			redirect_to: addQueryArgs( redirectUrl, {
				hosting_features: 'activated',
			} ),
			initiate_transfer_context: 'hosting',
			initiate_transfer_geo_affinity: options.geo_affinity || '',
		} );
		// Only ask the post-transfer step to wait for SFTP if the plan actually grants it.
		// Personal/Premium plans include `atomic` (so the transfer can run) but not SFTP, so
		// waiting on it would loop forever — see DOTDEV-412.
		if ( hasSftpFeature ) {
			params.set( 'feature', FEATURE_SFTP );
		}
		page( `/setup/transferring-hosted-site?${ params }` );
	};

	return (
		<>
			{ siteId && <QueryEligibility siteId={ siteId } /> }
			<HostingHeroButton
				{ ...props }
				text={ text ?? translate( 'Activate now' ) }
				onClick={ () => {
					dispatch( recordTracksEvent( 'calypso_hosting_features_activate_click' ) );

					// Additional event to align analysis across dashboards.
					// See: https://wp.me/pgz0xU-qp
					dispatch(
						recordTracksEvent( 'calypso_dashboard_hosting_feature_activation_click', {
							path,
							show_modal: ! canStartTransferDirectly,
						} )
					);

					if ( canStartTransferDirectly ) {
						return handleTransfer( {} );
					}

					return setShowEligibility( true );
				} }
			/>

			{ showEligibility && (
				<Modal
					className="plugin-details-cta__dialog-content"
					title={ translate( 'Before you continue' ) }
					onRequestClose={ () => setShowEligibility( false ) }
					size="medium"
				>
					<EligibilityWarnings
						className="hosting__activating-warnings"
						onDismiss={ () => setShowEligibility( false ) }
						onProceed={ handleTransfer }
						backUrl={ redirectUrl }
						showDataCenterPicker
						standaloneProceed
						currentContext="hosting-features"
						path={ path }
					/>
				</Modal>
			) }
		</>
	);
}
