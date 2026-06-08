import config from '@automattic/calypso-config';
import { useSelector } from 'calypso/state';
import {
	getCurrentUser,
	getCurrentUserDisplayName,
	getCurrentUserEmail,
} from 'calypso/state/current-user/selectors';

type Nav2026Props =
	| {
			nav2026: true;
			nav2026Variant: 1 | 2;
			userAvatar?: string;
			userName?: string;
			userEmail?: string;
	  }
	| Record< string, never >;

/**
 * Props to spread onto `UniversalNavbarHeader` to opt into the 2026 Global Nav.
 * Returns `{}` when the flag is off, so `{ ...useNav2026Props() }` is a no-op then.
 */
export function useNav2026Props(): Nav2026Props {
	const nav2026 = config.isEnabled( 'nav-redesign/2026' );
	const userAvatar = useSelector( ( state ) => getCurrentUser( state )?.avatar_URL );
	const userName = useSelector( getCurrentUserDisplayName );
	const userEmail = useSelector( getCurrentUserEmail );

	if ( ! nav2026 ) {
		return {};
	}

	return {
		nav2026: true,
		nav2026Variant: config.isEnabled( 'nav-redesign/2026-variant-2' ) ? 2 : 1,
		userAvatar,
		userName,
		userEmail,
	};
}
