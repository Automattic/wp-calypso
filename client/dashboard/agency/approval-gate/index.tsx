import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lock } from '@wordpress/icons';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Callout } from '../../components/callout';
import { Text } from '../../components/text';
import { isAgencyApproved } from '../marketplace/is-agency-approved';
import { useContactSupport } from '../support/use-contact-support';
import devSiteImage from './images/gate-dev-site.jpg';
import purchaseImage from './images/gate-purchase.jpg';
import referralImage from './images/gate-referral.jpg';

import './style.scss';

/** The actions an agency can only take once it is approved. */
export type ApprovalGateKind = 'purchase' | 'referral' | 'dev-site';

const IMAGES: Record< ApprovalGateKind, string > = {
	purchase: purchaseImage,
	referral: referralImage,
	'dev-site': devSiteImage,
};

function getTitle( kind: ApprovalGateKind ) {
	switch ( kind ) {
		case 'referral':
			return __( 'Referrals unlock once you’re approved' );
		case 'dev-site':
			return __( 'Development sites unlock once you’re approved' );
		default:
			return __( 'Purchases unlock once you’re approved' );
	}
}

function getBenefit( kind: ApprovalGateKind ) {
	switch ( kind ) {
		case 'referral':
			return __(
				'Then you can refer products and hosting to your clients and earn a commission on every payment.'
			);
		case 'dev-site':
			return __(
				'Then you can build client sites on free development sites and only pay when you launch.'
			);
		default:
			return __( 'Then you can check out and buy products and hosting for your clients’ sites.' );
	}
}

/**
 * Whether the agency can only look around for now: it is in review or was not approved. The
 * gated controls stay usable and open `ApprovalGate` instead of their action.
 *
 * False until the agency loads, so callers keep their control disabled until then.
 */
export function useIsApprovalGated() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	return !! agency && ! isAgencyApproved( agency );
}

/** Says what unlocks once the agency is approved, in place of a gated action. */
export function ApprovalGate( { kind, onClose }: { kind: ApprovalGateKind; onClose: () => void } ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const { recordTracksEvent } = useAnalytics();
	const approvalStatus = agency?.approval_status;
	const isRejected = approvalStatus === 'rejected';

	useEffect( () => {
		recordTracksEvent( 'calypso_a4a_approval_gate_view', {
			kind,
			approval_status: approvalStatus,
		} );
	}, [ kind, approvalStatus, recordTracksEvent ] );

	const { openContactForm } = useContactSupport();
	const close = () => {
		recordTracksEvent( 'calypso_a4a_approval_gate_close', {
			kind,
			approval_status: approvalStatus,
		} );
		onClose();
	};
	const title = isRejected ? __( 'We haven’t approved your agency' ) : getTitle( kind );

	return (
		<Modal
			title={ title }
			// The header is hidden, so the dialog takes its name from here.
			contentLabel={ title }
			onRequestClose={ close }
			__experimentalHideHeader
		>
			<div className="a4a-approval-gate">
				<Callout
					icon={ lock }
					image={ IMAGES[ kind ] }
					imageVariant="full-bleed"
					title={ title }
					titleAs="h2"
					description={
						isRejected ? (
							<Text variant="muted">
								{ __(
									'Purchases, referrals, and development sites are open to approved agencies only. If you think this was done in error, contact support to discuss it.'
								) }
							</Text>
						) : (
							<>
								<Text variant="muted">{ getBenefit( kind ) }</Text>
								<Text variant="muted">
									{ __(
										'We’re reviewing your application. Most are reviewed within a few hours.'
									) }
								</Text>
							</>
						)
					}
					actions={
						isRejected ? (
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									size="compact"
									__next40pxDefaultSize
									onClick={ () => {
										recordTracksEvent( 'calypso_a4a_approval_gate_contact_support_click', {
											kind,
										} );
										onClose();
										openContactForm();
									} }
								>
									{ __( 'Contact support' ) }
								</Button>
								<Button variant="secondary" size="compact" __next40pxDefaultSize onClick={ close }>
									{ __( 'Close' ) }
								</Button>
							</ButtonStack>
						) : (
							<Button variant="primary" size="compact" __next40pxDefaultSize onClick={ close }>
								{ __( 'Keep exploring' ) }
							</Button>
						)
					}
				/>
			</div>
		</Modal>
	);
}
