import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

type LoginMethodImpressionProps = {
	method: string;
	badgeView: boolean;
	// Current login route (e.g. /log-in, /log-in/jetpack). Mirrors the `path`
	// on calypso_page_view so the two can be joined. Omitted when unavailable.
	path?: string;
	// The `from` query param on the login URL, when the entry point tags itself
	// (e.g. ?from=automattic-for-agencies-client). Lets us attribute which page
	// sent the user to /log-in. Omitted when the entry point doesn't set it.
	from?: string;
	children: ReactNode;
};

// Fires `calypso_login_method_impression` once on mount for the wrapped
// method. Renders children unchanged so it can wrap any login method button
// without affecting layout.
const LoginMethodImpression = ( {
	method,
	badgeView,
	path,
	from,
	children,
}: LoginMethodImpressionProps ) => {
	useEffect( () => {
		recordTracksEvent( 'calypso_login_method_impression', {
			path,
			from,
			method,
			badge_view: badgeView,
		} );
		// Intentional: snapshot badge_view at mount only. The deps are
		// empty so a later badge change (e.g. lastUsedAuthenticationMethod
		// clearing when the user switches method) does not re-fire this with
		// badge_view: false and pollute the unbadged baseline.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	return <>{ children }</>;
};

export default LoginMethodImpression;
