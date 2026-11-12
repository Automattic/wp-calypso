import migrationAuthorization from '../migration-authorization';

const page = '/sites/destination.wordpress.com/migration-overview/share-access';
const state = '3254ec89-90f1-4bf6-ab04-74d63cdb8063';

function handle( path, query ) {
	const res = { set: jest.fn(), status: jest.fn().mockReturnThis(), end: jest.fn() };
	const next = jest.fn();
	migrationAuthorization( { path, query }, res, next );
	return { res, next };
}

test( 'moves legacy callback credentials from the query into a private fragment', () => {
	const { res, next } = handle( page + '/authorize', {
		state,
		user_login: 'test user',
		password: 'application password',
	} );

	expect( next ).not.toHaveBeenCalled();
	expect( res.set ).toHaveBeenCalledWith( {
		'Cache-Control': 'no-store',
		'Referrer-Policy': 'no-referrer',
		Location: `${ page }#migration-authorization=${ state }&user_login=test+user&password=application+password`,
	} );
	expect( res.status ).toHaveBeenCalledWith( 303 );
	expect( res.end ).toHaveBeenCalledWith();
} );

test( 'allows the browser to inherit an existing callback fragment', () => {
	const { res } = handle( page + '/authorize', { state } );
	expect( res.set ).toHaveBeenCalledWith( expect.objectContaining( { Location: page } ) );
} );

test( 'continues through ordinary requests', () => {
	const { next } = handle( page, {} );
	expect( next ).toHaveBeenCalledTimes( 1 );
} );
