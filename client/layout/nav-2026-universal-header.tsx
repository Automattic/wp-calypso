import { UniversalNavbarHeader, type HeaderProps } from '@automattic/wpcom-template-parts';
import { useSelector } from 'calypso/state';
import {
	getCurrentUser,
	getCurrentUserDisplayName,
	getCurrentUserEmail,
} from 'calypso/state/current-user/selectors';

/**
 * `UniversalNavbarHeader` wired to the signed-in user's avatar, name, and
 * email, which the 2026 nav's mobile menu shows when logged in.
 */
export function Nav2026UniversalHeader( props: HeaderProps ) {
	const userAvatar = useSelector( ( state ) => getCurrentUser( state )?.avatar_URL );
	const userName = useSelector( getCurrentUserDisplayName );
	const userEmail = useSelector( getCurrentUserEmail );

	return (
		<UniversalNavbarHeader
			{ ...props }
			userAvatar={ userAvatar }
			userName={ userName }
			userEmail={ userEmail }
		/>
	);
}
