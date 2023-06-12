import page from 'page';
import { addQueryArgs } from 'calypso/lib/route';
import { sanitizeInt } from './helpers';
import { Subscribers } from './main';

const pageChanged = ( path ) => ( pageNumber ) => {
	if ( window ) {
		window.scrollTo( 0, 0 );
	}
	return page( addQueryArgs( { page: pageNumber }, path ) );
};

export function subscribers( context, next ) {
	const { path, query } = context;
	const pageNumber = sanitizeInt( query.page ) ?? 1;

	context.primary = <Subscribers page={ pageNumber } pageChanged={ pageChanged( path ) } />;

	next();
}
