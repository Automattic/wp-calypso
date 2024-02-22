import { type Callback } from '@automattic/calypso-router';
import MainSidebar from '../../components/sidebar-menu/main';

export const pluginsContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = <div>plugins</div>;

	next();
};
