import { activeAgencyQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalText as Text, Button, Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { lock } from '@wordpress/icons';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Callout } from '../../components/callout';
import { isAgencyApproved } from '../marketplace/is-agency-approved';
import { useContactSupport } from '../support/use-contact-support';
import devSiteImage from './images/gate-dev-site.jpg';
import purchaseImage from './images/gate-purchase.jpg';
import referralImage from './images/gate-referral.jpg';

import './style.scss';

/** The actions an agency can only take once it is approved. */
export type ApprovalGateKind = 'purchase' | 'referral' | 'dev-site';

// What the agency gets once approved: the welcome tour's drawing for that section on the
// tour's field.
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
 * Gates an action the agency can only take once it is approved. The control stays live; for an
 * agency that is pending or rejected, using it opens the gate instead.
 */
export function useApprovalGate( kind: ApprovalGateKind ) {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const isGated = !! agency && ! isAgencyApproved( agency );
	const isRejected = agency?.approval_status === 'rejected';
	const [ isOpen, setIsOpen ] = useState( false );

	return {
		isGated,
		openGate: () => setIsOpen( true ),
		gate:
			isGated && isOpen ? (
				<ApprovalGateModal
					kind={ kind }
					isRejected={ isRejected }
					onClose={ () => setIsOpen( false ) }
				/>
			) : null,
	};
}

/**
 * The WordPress.com upsell callout, used as it is on the gated hosting pages, shown on click
 * over a frosted page.
 */
function ApprovalGateModal( {
	kind,
	isRejected,
	onClose,
}: {
	kind: ApprovalGateKind;
	isRejected: boolean;
	onClose: () => void;
} ) {
	const { openContactForm } = useContactSupport();
	const title = isRejected ? __( 'We haven’t approved your agency' ) : getTitle( kind );

	return (
		<Modal
			title={ title }
			onRequestClose={ onClose }
			__experimentalHideHeader
			overlayClassName="a4a-approval-gate-overlay"
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
										onClose();
										openContactForm();
									} }
								>
									{ __( 'Contact support' ) }
								</Button>
								<Button
									variant="secondary"
									size="compact"
									__next40pxDefaultSize
									onClick={ onClose }
								>
									{ __( 'Close' ) }
								</Button>
							</ButtonStack>
						) : (
							<Button variant="primary" size="compact" __next40pxDefaultSize onClick={ onClose }>
								{ __( 'Keep exploring' ) }
							</Button>
						)
					}
				/>
			</div>
		</Modal>
	);
}
