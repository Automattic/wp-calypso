import { FEATURE_SFTP } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Modal, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState, useEffect } from 'react';
import EligibilityWarnings from 'calypso/blocks/eligibility-warnings';
import { Callout } from 'calypso/dashboard/components/callout';
import { useSiteTransferStatusQuery } from 'calypso/landing/stepper/hooks/use-site-transfer/query';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import illustrationUrl from './hosting-callout-illustration.svg';

export function HostingActivationCallout( {
	siteId,
	redirectUrl,
}: {
	siteId: number;
	redirectUrl?: string;
} ) {
	const [ showEligibility, setShowEligibility ] = useState( false );
	const { data: siteTransferData } = useSiteTransferStatusQuery( siteId, {
		refetchIntervalInBackground: true,
	} );

	const isActivating = siteTransferData?.isTransferring;
	const isActivated = transferStates.COMPLETED;

	const handleClick = () => {
		setShowEligibility( true );
	};

	const handleTransfer = ( options: { geo_affinity?: string } ) => {
		const transferUrl = addQueryArgs( '/setup/transferring-hosted-site', {
			siteId,
			redirect_to: addQueryArgs(
				redirectUrl ?? window.location.href.replace( window.location.origin, '' ),
				{
					hosting_features: 'activated',
				}
			),
			feature: FEATURE_SFTP,
			initiate_transfer_context: 'hosting',
			initiate_transfer_geo_affinity: options.geo_affinity || '',
		} );

		page( transferUrl );
	};

	useEffect( () => {
		if ( isActivated && redirectUrl ) {
			page.replace( redirectUrl );
		}
	}, [ isActivated, redirectUrl ] );

	return (
		<>
			<Callout
				title={ __( 'Active hosting features' ) }
				titleAs="h3"
				image={ illustrationUrl }
				description={
					<>
						<Text as="p" variant="muted">
							{ __(
								'Your plan includes a range of powerful hosting features. Activate them to get started.'
							) }
						</Text>
						<Text as="p" variant="muted">
							{ __( 'Git-based deployments' ) }
							{ __( 'Server monitoring' ) }
							{ __( 'Access and error logs' ) }
							{ __( 'Secure access via SFTP/SSH' ) }
							{ __( 'Advanced server settings' ) }
						</Text>
					</>
				}
				actions={
					<Button
						text={ isActivating ? __( 'Activating…' ) : __( 'Activate' ) }
						variant="primary"
						size="compact"
						isBusy={ isActivating }
						onClick={ handleClick }
					/>
				}
			/>
			{ showEligibility && (
				<Modal
					className="plugin-details-cta__dialog-content"
					title={ __( 'Before you continue' ) }
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
					/>
				</Modal>
			) }
		</>
	);
}

export function HostingUpsellCallout( { siteSlug }: { siteSlug: string } ) {
	return (
		<Callout
			title={ __( 'Unlock all hosting features' ) }
			titleAs="h3"
			image={ illustrationUrl }
			description={
				<>
					<Text as="p" variant="muted">
						{ __( 'Upgrade to the Business plan to unlock a range of powerful hosting features.' ) }
					</Text>
					<Text as="p" variant="muted">
						{ __( 'Git-based deployments' ) }
						{ __( 'Server monitoring' ) }
						{ __( 'Access and error logs' ) }
						{ __( 'Secure access via SFTP/SSH' ) }
						{ __( 'Advanced server settings' ) }
					</Text>
				</>
			}
			actions={
				<Button
					text={ __( 'Upgrade plan' ) }
					variant="primary"
					size="compact"
					href={ `/checkout/${ siteSlug }/business` }
				/>
			}
		/>
	);
}
