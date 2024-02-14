import { type Callback } from '@automattic/calypso-router';
import Sidebar from './components/sidebar';

export const a8cForAgenciesContext: Callback = ( context, next ) => {
	context.secondary = <Sidebar path="/" menuItems={ [] } />;
	context.primary = <div>Hello, World!</div>;

	next();
};
