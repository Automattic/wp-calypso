import config from '@automattic/calypso-config';
import { useMemo } from '@wordpress/element';

const FEATURE_FLAG = 'purchases/cancel-refund-separation';
const QUERY_PARAM = 'cancel_refund_separation';

const isQueryOverrideEnabled = (): boolean | null => {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	const params = new URLSearchParams( window.location.search );
	if ( ! params.has( QUERY_PARAM ) ) {
		return null;
	}

	return params.get( QUERY_PARAM ) !== '0';
};

export function isCancelRefundSeparationEnabled(): boolean {
	const override = isQueryOverrideEnabled();
	if ( override !== null ) {
		return override;
	}

	return config.isEnabled( FEATURE_FLAG );
}

export function useCancelRefundSeparationEligibility(): boolean {
	return useMemo( () => isCancelRefundSeparationEnabled(), [] );
}
