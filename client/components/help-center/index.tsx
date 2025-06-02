import AsyncLoad from 'calypso/components/async-load';
import { HelpCenterAppProps, HelpCenterButtonProps } from './types';

export const AsyncHelpCenterApp = ( props: HelpCenterAppProps ) => {
	return <AsyncLoad require="./help-center-app" placeholder={ null } { ...props } />;
};

export const AsyncHelpCenterButton = ( props: HelpCenterButtonProps ) => {
	return <AsyncLoad require="./help-center-button" placeholder={ null } { ...props } />;
};
