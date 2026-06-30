import AsyncLoad from 'calypso/components/async-load';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { HelpCenterAppProps } from './help-center-app';

const loadHelpCenterApp = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-help-center-help-center-app" */ './help-center-app'
	);

type AsyncHelpCenterAppProps = Omit< HelpCenterAppProps, 'currentUser' > & {
	currentUser?: HelpCenterAppProps[ 'currentUser' ];
};

const AsyncHelpCenterApp = ( {
	currentUser: currentUserProp,
	...props
}: AsyncHelpCenterAppProps ) => {
	// When login is required, detect it from the live store rather than the passed prop, which a
	// caller may have captured before the user authenticated (e.g. signing up mid-onboarding).
	const reduxCurrentUser = useSelector( getCurrentUser );
	const currentUser = props.requireLogin ? reduxCurrentUser ?? currentUserProp : currentUserProp;

	if ( props.requireLogin && ! currentUser ) {
		return null;
	}

	return (
		<AsyncLoad
			require={ loadHelpCenterApp }
			placeholder={ null }
			{ ...props }
			currentUser={ currentUser }
			locale={ props.locale ?? currentUser?.language }
		/>
	);
};

export default AsyncHelpCenterApp;
