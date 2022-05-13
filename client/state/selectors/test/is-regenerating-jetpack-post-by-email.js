import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import { regeneratePostByEmail } from 'calypso/state/jetpack/settings/actions';
import isRegeneratingJetpackPostByEmail from 'calypso/state/selectors/is-regenerating-jetpack-post-by-email';

describe( 'isRegeneratingJetpackPostByEmail()', () => {
	test( 'should return true if post by email is currently being regenerated', () => {
		const siteId = 87654321;
		const action = regeneratePostByEmail( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRegeneratingJetpackPostByEmail( state, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if post by email is currently not being regenerated', () => {
		const siteId = 87654321;
		const action = regeneratePostByEmail( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'success',
				},
			},
		};

		const output = isRegeneratingJetpackPostByEmail( state, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if that site is not known', () => {
		const siteId = 87654321;
		const action = regeneratePostByEmail( 12345678 );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRegeneratingJetpackPostByEmail( state, siteId );
		expect( output ).toBe( false );
	} );
} );
