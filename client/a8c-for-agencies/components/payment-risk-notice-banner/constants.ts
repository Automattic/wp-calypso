import { isEnabled } from '@automattic/calypso-config';

export const PAYMENT_RISK_NOTICE_BANNER_FLAG = 'a4a-payment-risk-notice-banner';

export type PaymentRiskNoticeSeverity = 'warning' | 'error';

export const PAYMENT_RISK_NOTICE_SEVERITY: PaymentRiskNoticeSeverity = 'error';

export const isPaymentRiskNoticeBannerEnabled = () => isEnabled( PAYMENT_RISK_NOTICE_BANNER_FLAG );
