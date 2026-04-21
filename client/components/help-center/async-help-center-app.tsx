import AsyncLoad from 'calypso/components/async-load';
import type { HelpCenterAppProps } from './help-center-app';

const AsyncHelpCenterApp = ( props: HelpCenterAppProps ) => {
	if ( props.requireLogin && ! props.currentUser ) {
		return null;
	}
	return (
		<AsyncLoad
			require={ () =>
				import(
					/* webpackChunkName: "async-load-calypso-components-help-center-help-center-app" */ './help-center-app'
				)
			}
			placeholder={ null }
			{ ...props }
			locale={ props.locale ?? props.currentUser.language }
		/>
	);
};

export default AsyncHelpCenterApp;
