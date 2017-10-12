/** @format */
/**
 * External dependencies
 */
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import NotificationSettingsStore from '../';
import * as NotificationSettingsStoreActions from '../actions';
import wp from 'lib/wp';

const undocumented = wp.undocumented;

jest.mock( 'lib/wp', () => {
	const getNotificationSettingsStub = require( 'sinon' ).stub();

	return {
		undocumented: () => ( {
			me: () => ( {
				getNotificationSettings: getNotificationSettingsStub,
			} ),
		} ),
	};
} );

describe( 'index', () => {
	const changeSpy = sinon.spy();
	const getNotificationSettingsStub = undocumented().me().getNotificationSettings;

	beforeAll( () => {
		NotificationSettingsStore.on( 'change', changeSpy );
	} );

	afterAll( () => {
		NotificationSettingsStore.off( 'change', changeSpy );
	} );

	beforeEach( () => {
		getNotificationSettingsStub.reset();
		changeSpy.reset();
	} );

	test( 'should have a dispatch token', () => {
		expect( 'dispatchToken' in NotificationSettingsStore ).toBeTruthy();
	} );

	describe( 'get blog settings', () => {
		test( 'should return an array of blog settings', () => {
			const blogsSettings = [
				{
					blog_id: 123456,
					timeline: {
						new_comment: false,
						comment_like: true,
						post_like: false,
						follow: true,
						achievement: false,
						mentions: true,
					},
					email: {
						new_comment: false,
						comment_like: false,
						post_like: false,
						follow: false,
						achievement: false,
						mentions: true,
					},
				},
			];

			const settings = { blogs: blogsSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			const state = NotificationSettingsStore.getStateFor( 'blogs' );

			expect( getNotificationSettingsStub.callCount ).toEqual( 1 );
			expect( state.settings.toJS() ).toEqual( blogsSettings );
		} );
	} );

	describe( 'get other site settings', () => {
		test( 'should return an object for comments on other blogs', () => {
			const otherSettings = {
				timeline: {
					new_comment: false,
					comment_like: true,
					post_like: false,
					follow: true,
					achievement: false,
					mentions: true,
				},
				email: {
					new_comment: false,
					comment_like: false,
					post_like: false,
					follow: false,
					achievement: false,
					mentions: true,
				},
			};

			const settings = { other: otherSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			const state = NotificationSettingsStore.getStateFor( 'other' );

			expect( getNotificationSettingsStub.callCount ).toEqual( 1 );
			expect( state.settings.toJS() ).toEqual( otherSettings );
		} );
	} );

	describe( 'get email from WordPress settings', () => {
		test( 'should return an object for WP email settings', () => {
			const emailSettings = {
				new_comment: false,
				comment_like: true,
			};

			const settings = { wpcom: emailSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			const state = NotificationSettingsStore.getStateFor( 'wpcom' );

			expect( getNotificationSettingsStub.callCount ).toEqual( 1 );
			expect( state.settings.toJS() ).toEqual( emailSettings );
		} );
	} );

	describe( 'when toggle blog settings', () => {
		beforeEach( () => {
			const blogsSettings = [
				{
					blog_id: 123456,
					timeline: { new_comment: false },
					email: { new_comment: false },
					devices: [
						{ device_id: 123, new_comment: false },
						{ device_id: 1234, new_comment: false },
						{ device_id: 12345, new_comment: false },
					],
				},
				{
					blog_id: 1234567,
					timeline: { new_comment: false },
					email: { new_comment: false },
					devices: [
						{ device_id: 123, new_comment: false },
						{ device_id: 1234, new_comment: false },
						{ device_id: 12345, new_comment: false },
					],
				},
			];

			const settings = { blogs: blogsSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();
		} );

		test( 'should toggle a blog setting by stream and blog id', () => {
			NotificationSettingsStoreActions.toggle( 1234567, 'timeline', 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'blogs' );
			expect(
				state.settings
					.find( blog => blog.get( 'blog_id' ) === 123456 )
					.getIn( [ 'timeline', 'new_comment' ] )
			).toBeFalsy();

			expect(
				state.settings
					.find( blog => blog.get( 'blog_id' ) === 1234567 )
					.getIn( [ 'timeline', 'new_comment' ] )
			).toBeTruthy();
			expect(
				state.settings
					.find( blog => blog.get( 'blog_id' ) === 1234567 )
					.getIn( [ 'email', 'new_comment' ] )
			).toBeFalsy();
		} );

		test( 'should toggle a device setting for a blog by device id and blog id', () => {
			NotificationSettingsStoreActions.toggle( 1234567, 1234, 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'blogs' );

			expect(
				state.settings
					.find( blog => blog.get( 'blog_id' ) === 1234567 )
					.get( 'devices' )
					.find( device => device.get( 'device_id' ) === 1234 )
					.get( 'new_comment' )
			).toBeTruthy();

			expect(
				state.settings
					.find( blog => blog.get( 'blog_id' ) === 123456 )
					.get( 'devices' )
					.find( device => device.get( 'device_id' ) === 1234 )
					.get( 'new_comment' )
			).toBeFalsy();

			expect(
				state.settings
					.find( blog => blog.get( 'blog_id' ) === 1234567 )
					.get( 'devices' )
					.find( device => device.get( 'device_id' ) === 123 )
					.get( 'new_comment' )
			).toBeFalsy();
		} );
	} );

	describe( 'when toggle other blogs settings', () => {
		beforeEach( () => {
			const otherSettings = {
				timeline: { new_comment: false },
				email: { new_comment: false },
				devices: [
					{ device_id: 123, new_comment: false },
					{ device_id: 1234, new_comment: false },
					{ device_id: 12345, new_comment: false },
				],
			};

			const settings = { other: otherSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();
		} );

		test( 'should toggle a a setting by stream', () => {
			NotificationSettingsStoreActions.toggle( 'other', 'timeline', 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'other' );
			expect( state.settings.getIn( [ 'timeline', 'new_comment' ] ) ).toBeTruthy();
		} );

		test( 'should toggle a device setting by device id', () => {
			NotificationSettingsStoreActions.toggle( 'other', 1234, 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'other' );

			expect(
				state.settings
					.get( 'devices' )
					.find( device => device.get( 'device_id' ) === 1234 )
					.get( 'new_comment' )
			).toBeTruthy();

			expect(
				state.settings
					.get( 'devices' )
					.find( device => device.get( 'device_id' ) === 12345 )
					.get( 'new_comment' )
			).toBeFalsy();
		} );
	} );

	describe( 'when toggle other blogs settings', () => {
		test( 'should toggle a a setting by stream', () => {
			const wpcomSettings = {
				new_comment: false,
				comment_like: false,
			};

			const settings = { wpcom: wpcomSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			NotificationSettingsStoreActions.toggle( 'wpcom', null, 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'wpcom' );
			expect( state.settings.get( 'new_comment' ) ).toBeTruthy();
			expect( state.settings.get( 'comment_like' ) ).toBeFalsy();
		} );
	} );
} );
