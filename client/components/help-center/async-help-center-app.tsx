import AsyncLoad from 'calypso/components/async-load';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import type { HelpCenterAppProps } from './help-center-app';

const loadHelpCenterApp = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-help-center-help-center-app" */ './help-center-app'
	);

// When requireLogin is set, currentUser is derived from the store and the prop is optional;
// otherwise the caller must supply it, as the underlying Help Center requires one.
type AsyncHelpCenterAppProps =
	| ( Omit< HelpCenterAppProps, 'currentUser' | 'requireLogin' > & {
			requireLogin: true;
			currentUser?: HelpCenterAppProps[ 'currentUser' ];
	  } )
	| ( HelpCenterAppProps & { requireLogin?: false } );

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
