import { setSurvicateEventSuppression, setSurvicateSupportChatActive } from '@automattic/survicate';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { HELP_CENTER_STORE } from '../stores';
import type { HelpCenterSelect } from '@automattic/data-stores';

/**
 * Suppresses Survicate popups while the Help Center is shown.
 *
 * Sets a `support_chat_active` visitor trait (for Survicate dashboard targeting
 * rules) and suppresses code-triggered Survicate events.
 */
export function useSurvicateSuppression(): void {
	const isShown = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);

	useEffect( () => {
		setSurvicateSupportChatActive( !! isShown );
		setSurvicateEventSuppression( !! isShown );

		return () => {
			setSurvicateSupportChatActive( false );
			setSurvicateEventSuppression( false );
		};
	}, [ isShown ] );
}
