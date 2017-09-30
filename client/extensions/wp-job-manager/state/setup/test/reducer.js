/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_CREATE_PAGES,
	WP_JOB_MANAGER_CREATE_PAGES_ERROR,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR,
	WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
	WP_JOB_MANAGER_WIZARD_NEXT_STEP,
} from '../../action-types';
import reducer, { creating, fetching, nextStep, status } from '../reducer';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'creating',
			'fetching',
			'nextStep',
			'status',
		] );
	} );

	describe( 'creating()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = creating( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should set state to true if pages are being created', () => {
			const state = creating( undefined, {
				type: WP_JOB_MANAGER_CREATE_PAGES,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate creating values', () => {
			const state = creating( previousState, {
				type: WP_JOB_MANAGER_CREATE_PAGES,
				siteId: secondarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set state to false if not all pages were created', () => {
			const state = creating( previousState, {
				type: WP_JOB_MANAGER_CREATE_PAGES_ERROR,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set state to false if moving to the next step of the wizard', () => {
			const state = creating( previousState, {
				type: WP_JOB_MANAGER_WIZARD_NEXT_STEP,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );
	} );

	describe( 'fetching()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = fetching( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should set state to true if setup status is being fetched', () => {
			const state = fetching( undefined, {
				type: WP_JOB_MANAGER_FETCH_SETUP_STATUS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate fetching values', () => {
			const state = fetching( previousState, {
				type: WP_JOB_MANAGER_FETCH_SETUP_STATUS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		it( 'should set state to false if setup status could not be fetched', () => {
			const state = fetching( previousState, {
				type: WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );

		it( 'should set state to false if updating setup status', () => {
			const state = fetching( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );
	} );

	describe( 'nextStep()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = nextStep( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should set state to true if moving to the next step of the wizard', () => {
			const state = nextStep( previousState, {
				type: WP_JOB_MANAGER_WIZARD_NEXT_STEP,
				siteId: primarySiteId,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );
	} );

	describe( 'status()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		it( 'should default to an empty object', () => {
			const state = status( undefined, {} );

			expect( state ).to.deep.equal( {} );
		} );

		it( 'should index setup status by site ID', () => {
			const state = status( undefined, {
				type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
				siteId: primarySiteId,
				setupStatus: true,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
			} );
		} );

		it( 'should accumulate setup status', () => {
			const state = status( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
				siteId: secondarySiteId,
				setupStatus: false,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: false,
			} );
		} );

		it( 'should override previous setup status of same site ID', () => {
			const state = status( previousState, {
				type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
				siteId: primarySiteId,
				setupStatus: false,
			} );

			expect( state ).to.deep.equal( {
				[ primarySiteId ]: false,
			} );
		} );
	} );
} );
