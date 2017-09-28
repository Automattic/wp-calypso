jest.mock( 'lib/wp', () => {
	const getNotificationSettingsStub = require( 'sinon' ).stub();

	return {
		undocumented: () => ( {
			me: () => ( {
				getNotificationSettings: getNotificationSettingsStub
			} )
		} )
	};
} );

/**
 * External dependencies
 */
import { assert } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import * as NotificationSettingsStoreActions from '../actions';
import NotificationSettingsStore from '../';
import { undocumented } from 'lib/wp';

describe( 'index', () => {
	const changeSpy = sinon.spy();
	const getNotificationSettingsStub = undocumented().me().getNotificationSettings;

	before( () => {
		NotificationSettingsStore.on( 'change', changeSpy );
	} );

	after( () => {
		NotificationSettingsStore.off( 'change', changeSpy );
	} );

	beforeEach( () => {
		getNotificationSettingsStub.reset();
		changeSpy.reset();
	} );

	it( 'should have a dispatch token', () => {
		assert.property( NotificationSettingsStore, 'dispatchToken' );
	} );

	describe( 'get blog settings', () => {
		it( 'should return an array of blog settings', () => {
			const blogsSettings = [
				{
					blog_id: 123456,
					timeline: {
						new_comment: false,
						comment_like: true,
						post_like: false,
						follow: true,
						achievement: false,
						mentions: true
					},
					email: {
						new_comment: false,
						comment_like: false,
						post_like: false,
						follow: false,
						achievement: false,
						mentions: true
					}
				}
			];

			const settings = { blogs: blogsSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			const state = NotificationSettingsStore.getStateFor( 'blogs' );

			assert.equal( getNotificationSettingsStub.callCount, 1 );
			assert.deepEqual( state.settings.toJS(), blogsSettings );
		} );
	} );

	describe( 'get other site settings', () => {
		it( 'should return an object for comments on other blogs', () => {
			const otherSettings = {
				timeline: {
					new_comment: false,
					comment_like: true,
					post_like: false,
					follow: true,
					achievement: false,
					mentions: true
				},
				email: {
					new_comment: false,
					comment_like: false,
					post_like: false,
					follow: false,
					achievement: false,
					mentions: true
				}
			};

			const settings = { other: otherSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			const state = NotificationSettingsStore.getStateFor( 'other' );

			assert.equal( getNotificationSettingsStub.callCount, 1 );
			assert.deepEqual( state.settings.toJS(), otherSettings );
		} );
	} );

	describe( 'get email from WordPress settings', () => {
		it( 'should return an object for WP email settings', () => {
			const emailSettings = {
				new_comment: false,
				comment_like: true
			};

			const settings = { wpcom: emailSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			const state = NotificationSettingsStore.getStateFor( 'wpcom' );

			assert.equal( getNotificationSettingsStub.callCount, 1 );
			assert.deepEqual( state.settings.toJS(), emailSettings );
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
						{ device_id: 12345, new_comment: false }
					]
				},
				{
					blog_id: 1234567,
					timeline: { new_comment: false },
					email: { new_comment: false },
					devices: [
						{ device_id: 123, new_comment: false },
						{ device_id: 1234, new_comment: false },
						{ device_id: 12345, new_comment: false }
					]
				}
			];

			const settings = { blogs: blogsSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();
		} );

		it( 'should toggle a blog setting by stream and blog id', () => {
			NotificationSettingsStoreActions.toggle( 1234567, 'timeline', 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'blogs' );
			assert.notOk( state.settings.find( blog => blog.get( 'blog_id' ) === 123456 ).getIn( [ 'timeline', 'new_comment' ] ) );

			assert.ok( state.settings.find( blog => blog.get( 'blog_id' ) === 1234567 ).getIn( [ 'timeline', 'new_comment' ] ) );
			assert.notOk( state.settings.find( blog => blog.get( 'blog_id' ) === 1234567 ).getIn( [ 'email', 'new_comment' ] ) );
		} );

		it( 'should toggle a device setting for a blog by device id and blog id', () => {
			NotificationSettingsStoreActions.toggle( 1234567, 1234, 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'blogs' );

			assert.ok( state.settings.find( blog => blog.get( 'blog_id' ) === 1234567 )
				.get( 'devices' ).find( device => device.get( 'device_id' ) === 1234 )
				.get( 'new_comment' ) );

			assert.notOk( state.settings.find( blog => blog.get( 'blog_id' ) === 123456 )
				.get( 'devices' ).find( device => device.get( 'device_id' ) === 1234 )
				.get( 'new_comment' ) );

			assert.notOk( state.settings.find( blog => blog.get( 'blog_id' ) === 1234567 )
				.get( 'devices' ).find( device => device.get( 'device_id' ) === 123 )
				.get( 'new_comment' ) );
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
					{ device_id: 12345, new_comment: false }
				]
			};

			const settings = { other: otherSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();
		} );

		it( 'should toggle a a setting by stream', () => {
			NotificationSettingsStoreActions.toggle( 'other', 'timeline', 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'other' );
			assert.ok( state.settings.getIn( [ 'timeline', 'new_comment' ] ) );
		} );

		it( 'should toggle a device setting by device id', () => {
			NotificationSettingsStoreActions.toggle( 'other', 1234, 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'other' );

			assert.ok( state.settings.get( 'devices' )
				.find( device => device.get( 'device_id' ) === 1234 )
				.get( 'new_comment' ) );

			assert.notOk( state.settings.get( 'devices' )
				.find( device => device.get( 'device_id' ) === 12345 )
				.get( 'new_comment' ) );
		} );
	} );

	describe( 'when toggle other blogs settings', () => {
		it( 'should toggle a a setting by stream', () => {
			const wpcomSettings = {
				new_comment: false,
				comment_like: false
			};

			const settings = { wpcom: wpcomSettings };
			getNotificationSettingsStub.callsArgWith( 0, null, settings );
			NotificationSettingsStoreActions.fetchSettings();

			NotificationSettingsStoreActions.toggle( 'wpcom', null, 'new_comment' );

			const state = NotificationSettingsStore.getStateFor( 'wpcom' );
			assert.ok( state.settings.get( 'new_comment' ) );
			assert.notOk( state.settings.get( 'comment_like' ) );
		} );
	} );
} );
