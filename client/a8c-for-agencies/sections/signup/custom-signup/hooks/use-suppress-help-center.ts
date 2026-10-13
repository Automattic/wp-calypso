/**
 * PROTOTYPE — keeps the Help Center closed on `/custom-signup`.
 *
 * The Help Center remembers whether it was open (e.g. after "Contact sales &
 * support" on the Overview) and reopens on the next page load. The signup has
 * no way to open it, so any open state is treated as stale and closed.
 */
import { HelpCenter } from '@automattic/data-stores';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import type { HelpCenterSelect } from '@automattic/data-stores';

const HELP_CENTER_STORE = HelpCenter.register();

export default function useSuppressHelpCenter() {
	const isShown = useSelect(
		( select ) => ( select( HELP_CENTER_STORE ) as HelpCenterSelect ).isHelpCenterShown(),
		[]
	);
	const { setShowHelpCenter } = useDispatch( HELP_CENTER_STORE );

	useEffect( () => {
		if ( isShown ) {
			setShowHelpCenter( false );
		}
	}, [ isShown, setShowHelpCenter ] );
}
