import AsyncLoad from 'calypso/components/async-load';
import { HelpCenterAppProps } from './types';

const AsyncHelpCenterApp = ( props: HelpCenterAppProps ) => {
	return <AsyncLoad require="./help-center-app" placeholder={ null } { ...props } />;
};

export default AsyncHelpCenterApp;
