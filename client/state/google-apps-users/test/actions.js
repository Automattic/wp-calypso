/**
 * External dependencies
 */
import sinon, { match } from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	GOOGLE_APPS_USERS_FETCH,
	GOOGLE_APPS_USERS_FETCH_COMPLETED,
	GOOGLE_APPS_USERS_FETCH_FAILED
} from 'state/action-types';
import {
	fetchByDomain,
	fetchBySiteId
} from '../actions';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#fetchByDomain', () => {
		const noUpgradeDomain = 'noupgrade.com',
			upgradedDomain = 'yesupgrade.com',
			upgradeResponse = {
				accounts: [
					{
						domain: 'yesupgrade.com',
						email: 'test@yesupgrade.com',
						firstname: 'Test',
						fullname: 'Test User',
						lastname: 'Test',
						mailbox: 'test',
						site_id: 123,
						suspended: false
					}
				],
				licenses: {
					license_cost: '€48.00',
					license_type: 'standard',
					licenses_in_use: '1',
					purchase_license: 'https://wordpress.com/checkout/123/71/yesupgrade.com/?ref=google-apps',
					purchased_licenses: '1',
					suspended: true
				}
			};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/domains/${ noUpgradeDomain }/google-apps` )
				.reply( 400, {
					error: 'upgrade_required'
				} )
				.get( `/rest/v1.1/domains/${ upgradedDomain }/google-apps` )
				.reply( 200, upgradeResponse );
		} );

		it( 'should dispatch fetch action with domain data for a domain', () => {
			fetchByDomain( noUpgradeDomain )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: GOOGLE_APPS_USERS_FETCH,
				domain: noUpgradeDomain
			} );
		} );

		it( 'should dispatch complete when request completes', () => {
			fetchByDomain( upgradedDomain )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
					items: upgradeResponse.accounts
				} );
			} );
		} );

		it( 'should dispatch fail when the request fails', () => {
			fetchByDomain( noUpgradeDomain )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GOOGLE_APPS_USERS_FETCH_FAILED,
					error: match( {
						statusCode: 400,
						error: 'upgrade_required',
					} )
				} );
			} );
		} );
	} );

	describe( '#fetchBySiteId', () => {
		const noUpgradeSiteId = 12345678,
			upgradedSiteId = 87654321,
			upgradeResponse = {
				accounts: [
					{
						domain: 'yesupgrade.com',
						email: 'test@yesupgrade.com',
						firstname: 'Test',
						fullname: 'Test User',
						lastname: 'Test',
						mailbox: 'test',
						site_id: 12345678,
						suspended: false
					}
				]
			};

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( `/rest/v1.1/sites/${ noUpgradeSiteId }/google-apps` )
				.reply( 400, {
					error: 'upgrade_required'
				} )
				.get( `/rest/v1.1/sites/${ upgradedSiteId }/google-apps` )
				.reply( 200, upgradeResponse );
		} );

		it( 'should dispatch fetch action with site data for a site', () => {
			fetchBySiteId( noUpgradeSiteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: GOOGLE_APPS_USERS_FETCH,
				siteId: noUpgradeSiteId
			} );
		} );

		it( 'should dispatch complete when request completes', () => {
			fetchBySiteId( upgradedSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GOOGLE_APPS_USERS_FETCH_COMPLETED,
					items: upgradeResponse.accounts
				} );
			} );
		} );

		it( 'should dispatch fail when the request fails', () => {
			fetchBySiteId( noUpgradeSiteId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: GOOGLE_APPS_USERS_FETCH_FAILED,
					error: match( {
						statusCode: 400,
						error: 'upgrade_required',
					} )
				} );
			} );
		} );
	} );
} );
