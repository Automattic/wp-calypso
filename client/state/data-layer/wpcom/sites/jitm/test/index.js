import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { fetchJITM, dismissJITM } from 'calypso/state/jitm/actions';
import { doFetchJITM, doDismissJITM } from '..';

describe( 'jitms', () => {
	describe( '#doFetchJITM', () => {
		test( 'should dispatch a get action with the site id and the message path', () => {
			const siteId = 123;
			const messagePath = 'test:foo:bar';
			const action = fetchJITM( siteId, messagePath );

			expect( doFetchJITM( action ) ).toEqual(
				http(
					{
						method: 'GET',
						apiNamespace: 'wpcom/v3',
						path: `/sites/${ siteId }/jitm`,
						query: {
							message_path: messagePath,
							query: undefined,
							locale: undefined,
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
						method: 'POST',
						apiNamespace: 'wpcom/v3',
						path: `/sites/${ siteId }/jitm`,
						body: {
							feature_class: featureClass,
							id: messageId,
						},
					},
					action
				)
			);
		} );
	} );
} );
