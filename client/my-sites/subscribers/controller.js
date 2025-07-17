import JetpackSubscribers from './jetpack-subscribers';
import SubscribersPage from './main';

export function subscribers( context, next ) {
	context.primary = <SubscribersPage subscriberId={ context.params.subscriberId } />;
	next();
}

export function jetpackSubscribers( context, next ) {
	context.primary = <JetpackSubscribers />;
	next();
}
