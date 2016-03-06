/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { createReduxStore } from '../';

describe( 'state', () => {
	describe( 'createReduxStore', () => {
		it( 'can be called without specifying initialState', () => {
			const reduxStoreNoArgs = createReduxStore().getState();
			const reduxStoreWithEmptyState = createReduxStore( {} ).getState();
			expect( reduxStoreNoArgs ).to.be.an( 'object' );
			expect( reduxStoreWithEmptyState ).to.eql( reduxStoreNoArgs );
		} );

		it( 'is instantiated with initialState', () => {
			const user = { ID: 1234, display_name: 'test user', username: 'testuser' };
			const initialState = {
				currentUser: { id: 1234 },
				users: { items: { 1234: user } }
			};
			const reduxStoreWithCurrentUser = createReduxStore( initialState ).getState();
			expect( reduxStoreWithCurrentUser.currentUser ).to.eql( { id: 1234 } );
			expect( Object.keys( reduxStoreWithCurrentUser.users.items ).length ).to.eql( 1 );
			expect( reduxStoreWithCurrentUser.users.items[ 1234 ] ).to.eql( user );
		} );

		describe( 'invalid data', () => {
			before( () => {
				sinon.stub( console, 'error' );
			} );

			after( () => {
				console.error.restore();
			} );

			it( 'ignores non-existent keys', () => {
				expect( console.error.calledOnce ).to.eql( false );
				const reduxStoreNoArgs = createReduxStore().getState();
				const reduxStoreBadData = createReduxStore( { some: { bad: { stuff: true } } } ).getState();
				expect( reduxStoreBadData ).to.eql( reduxStoreNoArgs );
				expect( console.error.calledOnce ).to.eql( true );
			} );
		} );
	} );

	describe( 'application', () => {
		require( '../application/test/actions' );
		require( '../application/test/reducer' );
	} );

	describe( 'comments', () => {
		require( '../comments/test/actions' );
		require( '../comments/test/reducer' );
		require( '../comments/test/selectors' );
	} );

	describe( 'current-user', () => {
		require( '../current-user/test/actions' );
		require( '../current-user/test/reducer' );
		require( '../current-user/test/selectors' );
	} );

	describe( 'notices', () => {
		require( '../notices/test/actions' );
		require( '../notices/test/reducer' );
	} );

	describe( 'plugins', () => {
		describe( 'wporg', () => {
			require( '../plugins/wporg/test/reducer' );
			require( '../plugins/wporg/test/test-actions' );
			require( '../plugins/wporg/test/test-selectors' );
		} );
	} );

	describe( 'post-types', () => {
		require( '../post-types/test/actions' );
		require( '../post-types/test/reducer' );
		require( '../post-types/test/selectors' );
	} );

	describe( 'posts', () => {
		require( '../posts/test/actions' );
		require( '../posts/test/reducer' );
		require( '../posts/test/selectors' );
	} );

	describe( 'receipts', () => {
		require( '../receipts/test/reducer' );
	} );

	describe( 'sharing', () => {
		describe( 'publicize', () => {
			require( '../sharing/publicize/test/actions' );
			require( '../sharing/publicize/test/reducer' );
			require( '../sharing/publicize/test/selectors' );
		} );
	} );

	describe( 'site-settings', () => {
		describe( 'exporter', () => {
			require( '../site-settings/exporter/test/actions' );
			require( '../site-settings/exporter/test/reducer' );
			require( '../site-settings/exporter/test/selectors' );
		} );
	} );

	describe( 'sites', () => {
		require( '../sites/test/actions' );
		require( '../sites/test/reducer' );

		describe( 'plans', () => {
			require( '../sites/plans/test/actions' );
			require( '../sites/plans/test/reducer' );
		} );
	} );

	describe( 'support', () => {
		require( '../support/test/actions' );
		require( '../support/test/reducer' );
	} );

	describe( 'themes', () => {
		describe( 'current-theme', () => {
			require( '../themes/current-theme/test/index' );
			require( '../themes/current-theme/test/reducer' );
		} );

		describe( 'theme-details', () => {
			require( '../themes/theme-details/test/reducer' );
			require( '../themes/theme-details/test/selectors' );
		} );

		describe( 'themes', () => {
			require( '../themes/themes/test/index' );
			require( '../themes/themes/test/reducer' );
		} );

		describe( 'themes-last-query', () => {
			require( '../themes/themes-last-query/test/reducer' );
		} );

		describe( 'themes-list', () => {
			require( '../themes/themes-list/test/index' );
			require( '../themes/themes-list/test/reducer' );
		} );
	} );

	describe( 'ui', () => {
		require( '../ui/test/actions' );
		require( '../ui/test/reducer' );
		require( '../ui/test/selectors' );

		describe( 'editor', () => {
			describe( 'contact-form', () => {
				require( '../ui/editor/contact-form/test/actions' );
				require( '../ui/editor/contact-form/test/reducer' );
			} );
		} );

		describe( 'reader', () => {
			describe( 'fullpost', () => {
				require( '../ui/reader/fullpost/test/actions' );
				require( '../ui/reader/fullpost/test/reducer' );
			} );
		} );
	} );

	describe( 'users', () => {
		require( '../users/test/actions' );
		require( '../users/test/reducer' );
		require( '../users/test/selectors' );
	} );
} );
