import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, type ReactNode } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import {
	A4A_PAYMENT_METHODS_LINK,
	EXTERNAL_WPCOM_PAYMENT_METHODS_URL,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import usePaymentRiskNotice from './use-payment-risk-notice';

import './style.scss';

const isExternalUrl = ( url: string ) => /^https?:\/\//.test( url );

type PaymentRiskNoticeBannerProps = {
	isFullWidth?: boolean;
	source: string;
};

export default function PaymentRiskNoticeBanner( {
	isFullWidth,
	source,
}: PaymentRiskNoticeBannerProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const paymentNotice = usePaymentRiskNotice();
	const noticeState = paymentNotice?.state;
	const noticeSeverity = paymentNotice?.severity;
	const ctaUrl = isEnabled( 'a4a-bd-checkout' )
		? EXTERNAL_WPCOM_PAYMENT_METHODS_URL
		: A4A_PAYMENT_METHODS_LINK;

	useEffect( () => {
		if ( noticeState && noticeSeverity ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_view', {
					source,
					state: noticeState,
					severity: noticeSeverity,
				} )
			);
		}
	}, [ dispatch, noticeState, noticeSeverity, source ] );

	const onActionClick = useCallback(
		( action: 'primary' | 'secondary' ) => {
			if ( ! noticeState || ! noticeSeverity ) {
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_cta_click', {
					action,
					source,
					state: noticeState,
					severity: noticeSeverity,
				} )
			);
		},
		[ dispatch, noticeState, noticeSeverity, source ]
	);

	if ( ! paymentNotice || ! noticeState || ! noticeSeverity ) {
		return null;
	}

	const canManagePaymentMethod = paymentNotice.can_current_user_manage_payment_method !== false;
	const primaryActionLabel =
		paymentNotice.primary_action_label ??
		paymentNotice.action_label ??
		( canManagePaymentMethod ? translate( 'Fix payment method' ) : undefined );
	const primaryActionUrl =
		paymentNotice.primary_action_url ??
		paymentNotice.action_url ??
		( canManagePaymentMethod ? ctaUrl : undefined );
	const actions: ReactNode[] = [];

	if ( primaryActionLabel && primaryActionUrl ) {
		actions.push(
			<Button
				key="primary-action"
				variant="primary"
				href={ primaryActionUrl }
				onClick={ () => onActionClick( 'primary' ) }
				target={ isExternalUrl( primaryActionUrl ) ? '_blank' : undefined }
				rel={ isExternalUrl( primaryActionUrl ) ? 'noopener noreferrer' : undefined }
				__next40pxDefaultSize
			>
				{ primaryActionLabel }
			</Button>
		);
	}

	if ( paymentNotice.secondary_action_label && paymentNotice.secondary_action_url ) {
		actions.push(
			<Button
				key="secondary-action"
				variant="secondary"
				href={ paymentNotice.secondary_action_url }
				onClick={ () => onActionClick( 'secondary' ) }
				target={ isExternalUrl( paymentNotice.secondary_action_url ) ? '_blank' : undefined }
				rel={
					isExternalUrl( paymentNotice.secondary_action_url ) ? 'noopener noreferrer' : undefined
				}
				__next40pxDefaultSize
			>
				{ paymentNotice.secondary_action_label }
			</Button>
		);
	}

	return (
		<LayoutBanner
			isFullWidth={ isFullWidth }
			className="a4a-payment-risk-notice-banner"
			level={ noticeSeverity }
			title={
				paymentNotice.title ??
				translate( 'Action required: We’re unable to renew your subscription(s)' )
			}
			actions={ actions }
			hideCloseButton
			allowTemporaryDismissal
			preferenceName="a4a-payment-risk-notice-banner-temporary-dismissed"
		>
			<div>
				{ paymentNotice.content ??
					translate(
						'We couldn’t process payment for one or more of your subscriptions with the payment method we have on file. If this isn’t resolved, your subscriptions will be cancelled and your sites may go offline. Please update your payment method to stay covered.'
					) }
			</div>
		</LayoutBanner>
	);
}
