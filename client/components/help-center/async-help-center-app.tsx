import AsyncLoad from 'calypso/components/async-load';
import type { HelpCenterAppProps } from './help-center-app';

const AsyncHelpCenterApp = ( props: HelpCenterAppProps ) => {
	return (
		<AsyncLoad
			require="./help-center-app"
			placeholder={ null }
			{ ...props }
			locale={ props.locale ?? props.currentUser.language }
		/>
	);
};

export default AsyncHelpCenterApp;
