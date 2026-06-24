import { isEnabled } from '@automattic/calypso-config';
import { HelpCenter } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, type MouseEvent } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import {
	A4A_PAYMENT_METHODS_LINK,
	EXTERNAL_WPCOM_PAYMENT_METHODS_URL,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import usePaymentRiskNotice from './use-payment-risk-notice';

import './style.scss';

const HELP_CENTER_STORE = HelpCenter.register();

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
	const { setShowHelpCenter, setNavigateToRoute } = useDataStoreDispatch( HELP_CENTER_STORE );
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

	const onCtaClick = useCallback( () => {
		if ( ! noticeState || ! noticeSeverity ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_cta_click', {
				source,
				state: noticeState,
				severity: noticeSeverity,
			} )
		);
	}, [ dispatch, noticeState, noticeSeverity, source ] );

	const onContactUsClick = useCallback(
		( event: MouseEvent< HTMLAnchorElement > ) => {
			event.preventDefault();

			if ( ! noticeState || ! noticeSeverity ) {
				return;
			}

			setShowHelpCenter( true );
			setNavigateToRoute( '/contact-form' );
			dispatch(
				recordTracksEvent( 'calypso_a4a_payment_risk_notice_banner_contact_us_click', {
					source,
					state: noticeState,
					severity: noticeSeverity,
				} )
			);
		},
		[ dispatch, noticeState, noticeSeverity, setNavigateToRoute, setShowHelpCenter, source ]
	);

	if ( ! paymentNotice || ! noticeState || ! noticeSeverity ) {
		return null;
	}

	const fixPaymentMethodCta = (
		<Button
			key="update-payment-method"
			variant="primary"
			href={ ctaUrl }
			onClick={ onCtaClick }
			target="_blank"
			rel="noopener noreferrer"
			__next40pxDefaultSize
		>
			{ translate( 'Fix payment method' ) }
		</Button>
	);

	const contactUsCta = (
		<Button
			key="contact-us"
			variant="secondary"
			href={ CONTACT_URL_HASH_FRAGMENT }
			onClick={ onContactUsClick }
			__next40pxDefaultSize
		>
			{ translate( 'Contact us' ) }
		</Button>
	);

	return (
		<LayoutBanner
			isFullWidth={ isFullWidth }
			className="a4a-payment-risk-notice-banner"
			level={ noticeSeverity }
			title={
				paymentNotice.title ??
				translate( 'Action required: We’re unable to renew your subscription(s)' )
			}
			actions={ [ fixPaymentMethodCta, contactUsCta ] }
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
