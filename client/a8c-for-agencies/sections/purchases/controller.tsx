import page, { type Callback } from '@automattic/calypso-router';
import PurchasesSidebar from '../../components/sidebar-menu/purchases';

export const purchasesContext: Callback = () => {
	page.redirect( '/purchases/licenses' );
};

export const licensesContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <PurchasesSidebar path={ context.path } />;
	context.primary = <div>Licenses</div>;

	next();
};
