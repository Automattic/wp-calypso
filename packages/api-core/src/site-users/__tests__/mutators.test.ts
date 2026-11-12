import nock from 'nock';
import { deleteSiteUser, updateCurrentSiteUserMeta } from '../mutators';

describe( 'deleteSiteUser', () => {
	afterEach( () => nock.cleanAll() );

	test( 'rejects when the site did not remove the user', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/99/users/12/delete' )
			.query( true )
			.reply( 200, { success: false } );

		await expect( deleteSiteUser( 99, 12 ) ).rejects.toThrow(
			'Failed to leave the site. Please try again.'
		);
	} );
} );

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
