import { setSurvicateEventSuppression } from '@automattic/survicate';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { HELP_CENTER_STORE } from '../stores';
import type { HelpCenterSelect } from '@automattic/data-stores';

/**
 * Suppresses Survicate popups while the Help Center is shown.
 * Suppresses code-triggered Survicate events.
 */
export function useSurvicateSuppression(): void {
	const isShown = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);

	useEffect( () => {
		setSurvicateEventSuppression( !! isShown );

		return () => {
			setSurvicateEventSuppression( false );
		};
	}, [ isShown ] );
}
