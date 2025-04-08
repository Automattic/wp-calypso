import config from '@automattic/calypso-config';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { fetchJITM, dismissJITM } from 'calypso/state/jitm/actions';
import { doFetchJITM, doDismissJITM } from '..';

jest.mock( '@automattic/calypso-config' );

const configMock = ( values ) => ( key ) => values[ key ];

describe( 'jitms', () => {
	describe( '#doFetchJITM', () => {
		test.each( [
			[ false, '/sites/123/jitm', 'should include sites/{siteId} in the path when not in Jetpack' ],
			[ true, '/jitm', 'should not include sites/{siteId} in the path when in Jetpack' ],
		] )( 'when is_running_in_jetpack_site is %p, %s', ( isJetpack, expectedPath ) => {
			config.isEnabled.mockImplementation(
				configMock( { is_running_in_jetpack_site: isJetpack } )
			);

			const siteId = 123;
			const messagePath = 'test:foo:bar';
			const action = fetchJITM( siteId, messagePath );

			expect( doFetchJITM( action ) ).toEqual(
				http(
					{
						method: 'GET',
						apiNamespace: 'wpcom/v3',
						path: expectedPath,
						query: {
							message_path: messagePath,
							query: undefined,
							locale: undefined,
						},
						isLocalApiCall: true, // required to use the wpcom/v3 namespace
					},
					action
				)
			);
		} );
	} );

	describe( '#doDismissJITM', () => {
		test.each( [
			[ false, '/sites/123/jitm', 'should include sites/{siteId} in the path when not in Jetpack' ],
			[ true, '/jitm', 'should not include sites/{siteId} in the path when in Jetpack' ],
		] )( 'when is_running_in_jetpack_site is %p, %s', ( isJetpack, expectedPath ) => {
			config.isEnabled.mockImplementation(
				configMock( { is_running_in_jetpack_site: isJetpack } )
			);

			const siteId = 123;
			const messageId = 'upsell-nudge-testing';
			const featureClass = 'retention-marketing';
			const action = dismissJITM( siteId, messageId, featureClass );

			expect( doDismissJITM( action ) ).toEqual(
				http(
					{
						method: 'POST',
						apiNamespace: 'wpcom/v3',
						path: expectedPath,
						body: {
							feature_class: featureClass,
							id: messageId,
						},
						isLocalApiCall: true, // required to use the wpcom/v3 namespace
					},
					action
				)
			);
		} );
	} );
} );
