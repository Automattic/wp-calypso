import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

type LoginMethodImpressionProps = {
	method: string;
	badgeView: boolean;
	children: ReactNode;
};

// Fires `calypso_login_method_impression` once on mount for the wrapped
// method. Renders children unchanged so it can wrap any login method button
// without affecting layout.
const LoginMethodImpression = ( { method, badgeView, children }: LoginMethodImpressionProps ) => {
	useEffect( () => {
		recordTracksEvent( 'calypso_login_method_impression', {
			flow: 'login',
			step: 'login-form',
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
