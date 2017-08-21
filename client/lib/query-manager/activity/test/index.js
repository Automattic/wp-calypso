/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ActivityQueryManager from '..';

/**
 * Module constants
 */
const DEFAULT_ACTIVITY_TS = 1410647400000; // "2014-09-14T00:30:00+02:00"

const DEFAULT_ACTIVITY = {
	action: 'update_available',
	action_trigger: 'jetpack_update_plugins_change',
	actor: {
		avatar_url: 'https://www.gravatar.com/avatar/0?d=mm',
		display_name: "User's display name",
		external_user_id: 1,
		is_ajax: false,
		is_cron: false,
		is_rest: true,
		is_wp_admin: false,
		is_wp_rest: false,
		is_xmlrpc: true,
		login: 'site-user',
		translated_role: 'administrator',
		user_email: 'user@example.com',
		user_roles: 'administrator',
		wpcom_user_id: 123456,
	},
	blog_id: 123456,
	group: 'plugin',
	jetpack_version: '5.3-alpha',
	name: 'plugin__update_available',
	object: {
		plugin: [
			{
				name: 'Jetpack by WordPress.com',
				slug: 'jetpack-dev/jetpack.php',
				version: '5.3-beta-12478-27f866d-master',
			},
		],
	},
	site_id: 2,
	ts_utc: DEFAULT_ACTIVITY_TS,
	type: 'jetpack-audit',
};

describe( 'ActivityQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new ActivityQueryManager();
	} );

	describe( '#matches()', () => {
		context( 'query.dateStart', () => {
			it( 'should return true if activity is at the specified time', () => {
				const isMatch = manager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true if activity is after the specified time', () => {
				const isMatch = manager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is before the specified time', () => {
				const isMatch = manager.matches(
					{
						dateStart: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );
		} );

		context( 'query.dateEnd', () => {
			it( 'should return true if activity is at the specified time', () => {
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );

			it( 'should return false if activity is after the specified time', () => {
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS - 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true if activity is before the specified time', () => {
				const isMatch = manager.matches(
					{
						dateEnd: DEFAULT_ACTIVITY_TS + 1,
					},
					DEFAULT_ACTIVITY
				);

				expect( isMatch ).to.be.true;
			} );
		} );
	} );
} );
