import { useSelect } from '@wordpress/data';
import { HELP_CENTER_STORE } from '../constants';
import type { HelpCenterSelect } from '@automattic/data-stores';

/**
 * The checkout support experiment's variation, while the Help Center was opened from checkout in
 * the experiment, for events recorded outside the Odie chat.
 * @returns The variation, or undefined.
 */
export const useCheckoutSupportVariation = () =>
	useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).getCheckoutSupportVariation(),
		[]
	);
