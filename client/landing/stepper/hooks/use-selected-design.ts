import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from '../stores';
import type { OnboardSelect } from '@automattic/data-stores';

export function useSelectedDesign() {
	return useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);
}
