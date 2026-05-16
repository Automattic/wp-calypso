import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import {
	A4A_PAYMENT_METHODS_LINK,
	EXTERNAL_WPCOM_PAYMENT_METHODS_URL,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isPaymentRiskNoticeBannerEnabled } from './constants';

import './style.scss';

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
	const isPaymentRiskNoticeEnabled = isPaymentRiskNoticeBannerEnabled();
	const ctaUrl = isEnabled( 'a4a-bd-checkout' )
		? EXTERNAL_WPCOM_PAYMENT_METHODS_URL
		: A4A_PAYMENT_METHODS_LINK;

	useEffect( () => {
		if ( isPaymentRiskNoticeEnabled ) {
			dispatch(
				recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_view', {
					source,
				} )
			);
		}
	}, [ dispatch, isPaymentRiskNoticeEnabled, source ] );

	const onCtaClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_cta_click', {
				source,
			} )
		);
	}, [ dispatch, source ] );

	if ( ! isPaymentRiskNoticeEnabled ) {
		return null;
	}

	const cta = (
		<Button key="update-payment-method" variant="primary" href={ ctaUrl } onClick={ onCtaClick }>
			{ translate( 'Update payment method' ) }
		</Button>
	);

	return (
		<LayoutBanner
			isFullWidth={ isFullWidth }
			className="a4a-payment-risk-notice-banner"
			level="error"
			title={ translate( 'Payment issue needs attention' ) }
			actions={ [ cta ] }
			hideCloseButton
			allowTemporaryDismissal
			preferenceName="a4a-payment-risk-notice-banner-temporary-dismissed"
		>
			<div>
				{ translate(
					'Your agency has a payment issue. Update your payment method to avoid service interruption.'
				) }
			</div>
		</LayoutBanner>
	);
}
