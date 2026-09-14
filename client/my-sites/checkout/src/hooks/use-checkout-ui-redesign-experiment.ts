import { useExperiment } from 'calypso/lib/explat';

// TODO: Replace with actual Explat experiment name before launch
const EXPERIMENT_NAME = 'wpcom_mobile_checkout_redesign_202603_v1';
const QUERY_PARAM = 'checkout_ui_redesign';

export function useCheckoutUiRedesignExperiment(): [ boolean, boolean ] {
	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME );
	const searchParams = new URLSearchParams( window.location.search );
	if ( searchParams.get( QUERY_PARAM ) === '1' ) {
		return [ false, true ];
	}
	return [ isLoading, assignment?.variationName === 'treatment' ];
}
