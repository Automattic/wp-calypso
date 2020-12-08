/**
 * Internal dependencies
 */
import { doFetchJITM, doDismissJITM } from '..';
import { fetchJITM, dismissJITM } from 'calypso/state/jitm/actions';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

describe( 'jitms', () => {
	describe( '#doFetchJITM', () => {
		test( 'should dispatch a get action with the site id and the message path', () => {
			const siteId = 123;
			const messagePath = 'test:foo:bar';
			const action = fetchJITM( siteId, messagePath );

			expect( doFetchJITM( action ) ).toEqual(
				http(
					{
						apiNamespace: 'rest',
						method: 'GET',
						path: `/v1.1/jetpack-blogs/${ siteId }/rest-api/`,
						query: {
							path: '/jetpack/v4/jitm',
							query: JSON.stringify( {
								message_path: messagePath,
							} ),
							http_envelope: 1,
						},
					},
					action
				)
			);
		} );
	} );

	describe( '#doDismissJITM', () => {
		test( 'should dispatch a post action with the message id and the feature class', () => {
			const siteId = 123;
			const messageId = 'upsell-nudge-testing';
			const featureClass = 'retention-marketing';
			const action = dismissJITM( siteId, messageId, featureClass );

			expect( doDismissJITM( action ) ).toEqual(
				http(
					{
						apiNamespace: 'rest',
						method: 'POST',
						path: `/jetpack-blogs/${ siteId }/rest-api/`,
						query: {
							path: '/jetpack/v4/jitm',
							body: JSON.stringify( {
								feature_class: featureClass,
								id: messageId,
							} ),
							http_envelope: 1,
							json: false,
						},
					},
					action
				)
			);
		} );
	} );
} );
