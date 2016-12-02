/**
 * Internal dependencies
 */
import sitesList from 'lib/sites-list';
import { receiveSites } from 'state/sites/actions';

export default ( { dispatch } ) => {
	const sites = sitesList();
	sites.on( 'change', () => {
		dispatch( receiveSites( sites.get() ) );
	} );

	return ( next ) => ( action ) => next( action );
};
