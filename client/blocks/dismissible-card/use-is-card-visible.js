import { useSelector } from 'react-redux';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
import { isCardDismissed } from './selectors';

/**
 * Whether a DismissibleCard with this preference name is currently rendered.
 *
 * Mirrors the condition DismissibleCard renders on, so callers outside the card
 * can tell whether it is on screen.
 * @param {?string} [preferenceName] The dismiss preference name, if the card is dismissible
 * @returns {boolean} Whether the card is visible
 */
export default function useIsCardVisible( preferenceName ) {
	return useSelector( ( state ) => {
		// A card with no preference name is not dismissible, so it never waits on preferences.
		if ( ! preferenceName ) {
			return true;
		}

		return hasReceivedRemotePreferences( state ) && ! isCardDismissed( preferenceName )( state );
	} );
}
