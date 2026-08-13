import { useSelector } from 'calypso/state';
import {
	getCurrentUser,
	getCurrentUserDisplayName,
	getCurrentUserEmail,
} from 'calypso/state/current-user/selectors';
import type { HeaderProps } from '@automattic/wpcom-template-parts';

type Nav2026Props =
	| {
			nav2026: true;
			userAvatar?: string;
			userName?: string;
			userEmail?: string;
	  }
	| {
			nav2026?: never;
			userAvatar?: never;
			userName?: never;
			userEmail?: never;
	  };

type Nav2026Options = {
	variant?: HeaderProps[ 'variant' ];
};

/**
 * Props to spread onto `UniversalNavbarHeader` to render the 2026 Global Nav.
 * Every universal header gets it except the minimal variant, which keeps the
 * old design.
 */
export function useNav2026Props( options: Nav2026Options = {} ): Nav2026Props {
	const userAvatar = useSelector( ( state ) => getCurrentUser( state )?.avatar_URL );
	const userName = useSelector( getCurrentUserDisplayName );
	const userEmail = useSelector( getCurrentUserEmail );

	if ( options.variant === 'minimal' ) {
		return {};
	}

	return { nav2026: true, userAvatar, userName, userEmail };
}
