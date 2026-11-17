import migrationAuthorization, { migrationAuthorizationPath } from '../migration-authorization';

const page = '/sites/destination.wordpress.com/migration-overview/share-access';
const state = '3254ec89-90f1-4bf6-ab04-74d63cdb8063';

function handle( query ) {
	const res = { set: jest.fn(), status: jest.fn().mockReturnThis(), end: jest.fn() };
	const params = migrationAuthorizationPath.exec( page + '/authorize' ).slice( 1 );
	migrationAuthorization( { params, query }, res );
	return res;
}

test( 'moves legacy callback credentials from the query into a private fragment', () => {
	const res = handle( {
		state,
		user_login: 'test user',
		password: 'application password',
	} );

	expect( res.set ).toHaveBeenCalledWith( {
		'Cache-Control': 'no-store',
		'Referrer-Policy': 'no-referrer',
		Location: `${ page }#migration-authorization=${ state }&user_login=test+user&password=application+password`,
	} );
	expect( res.status ).toHaveBeenCalledWith( 303 );
	expect( res.end ).toHaveBeenCalledWith();
} );

test( 'allows the browser to inherit an existing callback fragment', () => {
	const res = handle( { state } );
	expect( res.set ).toHaveBeenCalledWith( expect.objectContaining( { Location: page } ) );
} );

test( 'only matches the Dashboard authorization callback', () => {
	expect( migrationAuthorizationPath.test( page ) ).toBe( false );
	expect( migrationAuthorizationPath.test( page + '/authorize/extra' ) ).toBe( false );
	expect( migrationAuthorizationPath.test( '/authorize' ) ).toBe( false );
	expect( migrationAuthorizationPath.test( page + '/authorize/' ) ).toBe( true );
} );
