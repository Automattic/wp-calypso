import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { useAnalytics } from '../../../app/analytics';
import { Notice, NoticeActionLinkButton } from '../../../components/notice';
import { wpcomLink } from '../../../utils/link';
import type { Agency } from '@automattic/api-core';

export function hasPaymentRiskNotice( agency: Agency | null | undefined ) {
	return !! agency?.payment_notice?.state && !! agency.payment_notice.severity;
}

const isExternalUrl = ( url: string ) => /^https?:\/\//.test( url );

function ActionButton( {
	variant,
	href,
	label,
	onClick,
}: {
	variant: 'solid' | 'outline';
	href: string;
	label: string;
	onClick: () => void;
} ) {
	const isExternal = isExternalUrl( href );
	return (
		<NoticeActionLinkButton
			variant={ variant }
			href={ href }
			target={ isExternal ? '_blank' : undefined }
			rel={ isExternal ? 'noopener noreferrer' : undefined }
			onClick={ onClick }
		>
			{ label }
		</NoticeActionLinkButton>
	);
}

export default function PaymentRiskNotice( {
	agency,
	source,
}: {
	agency: Agency | null | undefined;
	source: string;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const notice = agency?.payment_notice;
	const state = notice?.state;
	const severity = notice?.severity;

	useEffect( () => {
		if ( state && severity ) {
			recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_view', {
				source,
				state,
				severity,
			} );
		}
	}, [ recordTracksEvent, source, state, severity ] );

	if ( ! notice || ! state || ! severity ) {
		return null;
	}

	const recordActionClick = ( action: 'primary' | 'secondary' ) =>
		recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_cta_click', {
			action,
			source,
			state,
			severity,
		} );

	const canManagePaymentMethod = notice.can_current_user_manage_payment_method !== false;
	const primaryLabel =
		notice.primary_action_label ??
		notice.action_label ??
		( canManagePaymentMethod ? __( 'Fix payment method' ) : undefined );
	const primaryUrl =
		notice.primary_action_url ??
		notice.action_url ??
		( canManagePaymentMethod ? wpcomLink( '/me/purchases/payment-methods' ) : undefined );

	const actions = [
		primaryLabel && primaryUrl && (
			<ActionButton
				key="primary"
				variant="solid"
				href={ primaryUrl }
				label={ primaryLabel }
				onClick={ () => recordActionClick( 'primary' ) }
			/>
		),
		notice.secondary_action_label && notice.secondary_action_url && (
			<ActionButton
				key="secondary"
				variant="outline"
				href={ notice.secondary_action_url }
				label={ notice.secondary_action_label }
				onClick={ () => recordActionClick( 'secondary' ) }
			/>
		),
	].filter( Boolean );

	return (
		<Notice
			variant={ severity }
			title={ notice.title ?? __( 'Action required: We’re unable to renew your subscription(s)' ) }
			actions={ actions.length ? actions : undefined }
		>
			{ notice.content ??
				__(
					'We couldn’t process payment for one or more of your subscriptions with the payment method we have on file. If this isn’t resolved, your subscriptions will be cancelled and your sites may go offline. Please update your payment method to stay covered.'
				) }
		</Notice>
	);
}
