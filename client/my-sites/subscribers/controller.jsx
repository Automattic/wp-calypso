import SubscribersPage from './main';

export function subscribers( context, next ) {
	context.primary = <SubscribersPage subscriberId={ context.params.subscriberId } />;
	next();
}
