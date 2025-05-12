import config from '@automattic/calypso-config';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { fetchJITM, dismissJITM } from 'calypso/state/jitm/actions';
import { doFetchJITM, doDismissJITM } from '..';

jest.mock( '@automattic/calypso-config' );

const configMock = ( values ) => ( key ) => values[ key ];

describe( 'jitms', () => {
	beforeAll( () => {
		config.isEnabled.mockImplementation( configMock( { is_running_in_jetpack_site: false } ) );
	} );

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
						isLocalApiCall: true, // required to use the wpcom/v3 namespace
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
						isLocalApiCall: true, // required to use the wpcom/v3 namespace
					},
					action
				)
			);
		} );
	} );

	describe( 'path modification based on running in Jetpack', () => {
		const siteId = 123;
		const actions = [
			{
				name: 'fetchJITM',
				action: fetchJITM( siteId, 'test:path' ),
				handler: doFetchJITM,
			},
			{
				name: 'dismissJITM',
				action: dismissJITM( siteId, 'test-id', 'test-class' ),
				handler: doDismissJITM,
			},
		];

		test.each( actions )(
			'$name should use /jitm path when in Jetpack',
			( { action, handler } ) => {
				config.isEnabled.mockImplementation( configMock( { is_running_in_jetpack_site: true } ) );
				expect( handler( action ).path ).toBe( '/jitm' );
			}
		);

		test.each( actions )(
			'$name should use /sites/{siteId}/jitm path when not in Jetpack',
			( { action, handler } ) => {
				config.isEnabled.mockImplementation( configMock( { is_running_in_jetpack_site: false } ) );
				expect( handler( action ).path ).toBe( `/sites/${ siteId }/jitm` );
			}
		);
	} );
} );
