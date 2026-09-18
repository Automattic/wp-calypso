import nock from 'nock';
import { updateCurrentSiteUserMeta } from '../mutators';

describe( 'updateCurrentSiteUserMeta', () => {
	afterEach( () => nock.cleanAll() );

	test( 'posts the meta to wp/v2 users/me and returns the user', async () => {
		const scope = nock( 'https://public-api.wordpress.com' )
			.post( '/wp/v2/sites/99/users/me', { meta: { wp_wpcom_plan_expiry_notice_dismiss: 1 } } )
			.query( true )
			.reply( 200, {
				id: 1,
				name: 'me',
				slug: 'me',
				meta: { wp_wpcom_plan_expiry_notice_dismiss: 1700000000 },
			} );

		const user = await updateCurrentSiteUserMeta( 99, { wp_wpcom_plan_expiry_notice_dismiss: 1 } );

		expect( scope.isDone() ).toBe( true );
		expect( user.meta?.wp_wpcom_plan_expiry_notice_dismiss ).toBe( 1700000000 );
	} );
} );
