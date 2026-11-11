import { addQueryArgs } from '@wordpress/url';
import { useCallback } from 'react';
import { useHelpCenter } from '../../app/help-center';

/**
 * Opens the Help Center on the A4A "Contact sales & support" form. The form
 * reads `pressable-offer` to prefill its heading, product, and message.
 */
export function useContactSupport() {
	const { setNavigateToRoute, setShowHelpCenter } = useHelpCenter();

	const openContactForm = useCallback(
		async ( { isPressableOffer }: { isPressableOffer?: boolean } = {} ) => {
			const url = addQueryArgs(
				'/contact-form',
				isPressableOffer ? { 'pressable-offer': 1 } : undefined
			);
			await setNavigateToRoute( url );
			await setShowHelpCenter( true );
		},
		[ setNavigateToRoute, setShowHelpCenter ]
	);

	return { openContactForm };
}
