import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import Pages from './main';

export function pages( context, next ) {
	const author =
		context.params.author === 'my' ? getCurrentUserId( context.store.getState() ) : null;
	context.primary = (
		<Pages status={ context.params.status } search={ context.query.s } author={ author } />
	);
	next();
}
