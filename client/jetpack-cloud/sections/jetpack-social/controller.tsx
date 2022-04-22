import ConnectionsPage from './connections';

export const connections: PageJS.Callback = ( context, next ) => {
	context.primary = <ConnectionsPage />;
	next();
};
