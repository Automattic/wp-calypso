import { useExperiment } from 'calypso/lib/explat';

export function useToSFoldableCard(): boolean {
	const [ isLoadingExperimentAssignment, experimentAssignment ] = useExperiment(
		'wp_web_checkout_tos_foldable_card_v1'
	);

	if ( ! isLoadingExperimentAssignment ) {
		return false;
	}

	if ( experimentAssignment?.variationName === 'treatment' ) {
		return true;
	}
	return false;
}
