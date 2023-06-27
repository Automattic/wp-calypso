import page from 'page';
import { addQueryArgs } from 'calypso/lib/route';
import { sanitizeInt } from './helpers';
import SubscribersPage from './main';
import SubscriberDetailsPage from './subscriber-details-page';

const pageChanged = ( path ) => ( pageNumber ) => {
	if ( window ) {
		window.scrollTo( 0, 0 );
	}
	return page( addQueryArgs( { page: pageNumber }, path ) );
};

export function subscribers( context, next ) {
	const { path, query } = context;
	const pageNumber = sanitizeInt( query.page ) ?? 1;

	context.primary = (
		<SubscribersPage pageNumber={ pageNumber } pageChanged={ pageChanged( path ) } />
	);

	next();
}

export function subscriberDetails( context, next ) {
	const { path } = context;
	const userId = path.split( '/' ).pop();

	context.primary = <SubscriberDetailsPage userId={ userId } />;

	next();
}

export function externalSubscriberDetails( context, next ) {
	const { path } = context;
	const subscriberId = path.split( '/' ).pop();

	context.primary = <SubscriberDetailsPage subscriptionId={ subscriberId } />;

	next();
}
