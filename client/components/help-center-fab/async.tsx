import AsyncLoad from 'calypso/components/async-load';
import type { HelpCenterFabProps } from './index';

const loadHelpCenterFab = () =>
	import( /* webpackChunkName: "async-load-calypso-components-help-center-fab" */ './index' );

const AsyncHelpCenterFab = ( props: HelpCenterFabProps ) => (
	<AsyncLoad require={ loadHelpCenterFab } placeholder={ null } { ...props } />
);

export default AsyncHelpCenterFab;
