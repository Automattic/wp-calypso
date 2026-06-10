import { isEnabled } from '@automattic/calypso-config';
import type { PaymentNoticeSeverity } from 'calypso/state/a8c-for-agencies/types';

export const PAYMENT_RISK_NOTICE_BANNER_FLAG = 'a4a-payment-risk-notice-banner';

export type PaymentRiskNoticeSeverity = PaymentNoticeSeverity;

export const isPaymentRiskNoticeBannerEnabled = () => isEnabled( PAYMENT_RISK_NOTICE_BANNER_FLAG );
