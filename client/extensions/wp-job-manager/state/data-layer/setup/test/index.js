/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice } from 'state/notices/actions';
import {
	announceFailure,
	createPages,
	fetchSetupStatus,
	fetchSetupStatusError,
	handleSuccess,
	handleFailure,
	updateSetupStatus,
} from '../';
import {
	createPagesError,
	fetchSetupStatusError as fetchStatusError,
	nextStep,
	updateSetupStatus as updateStatus,
} from '../../../setup/actions';
import { WP_JOB_MANAGER_CREATE_PAGES, WP_JOB_MANAGER_FETCH_SETUP_STATUS } from '../../../action-types';

const createPagesNotice = 'wpjm-create-pages';
const siteId = 101010;

describe( 'data layer', () => {
	let dispatch;

	beforeEach( () => {
		dispatch = sinon.spy();
	} );

	describe( 'pages', () => {
		const titles = [ 'Page 1', 'Page 2' ];
		const action = {
			type: WP_JOB_MANAGER_CREATE_PAGES,
			siteId,
			titles,
		};

		beforeEach( () => {
			createPages( { dispatch }, action );
		} );

		describe( '#createPages()', () => {
			it( 'should dispatch `removeNotice`', () => {
				expect( dispatch ).to.have.been.calledWith( removeNotice( 'wpjm-create-pages' ) );
			} );

			it( 'should dispatch one HTTP request for each title', () => {
				expect( dispatch ).to.have.been.calledWith( http( {
					method: 'POST',
					path: `/sites/${ siteId }/posts/new`,
					body: {
						title: titles[ 0 ],
						type: 'page',
					}
				}, action ) );

				expect( dispatch ).to.have.been.calledWith( http( {
					method: 'POST',
					path: `/sites/${ siteId }/posts/new`,
					body: {
						title: titles[ 1 ],
						type: 'page',
					}
				}, action ) );
			} );
		} );

		describe( '#announceFailure()', () => {
			it( 'should dispatch `createPagesError`', () => {
				announceFailure( dispatch, siteId );

				expect( dispatch ).to.have.been.calledWith( createPagesError( siteId ) );
			} );

			it( 'should dispatch `errorNotice`', () => {
				announceFailure( dispatch, siteId );

				expect( dispatch ).to.have.been.calledWith( errorNotice(
					translate( 'There was a problem creating the page(s). Please try again.' ),
					{ id: createPagesNotice }
				) );
			} );
		} );

		describe( '#handleSuccess()', () => {
			it( 'should not dispatch `createPagesError` or `nextStep` if not all requests have completed', () => {
				handleSuccess( { dispatch }, action );

				expect( dispatch ).to.not.have.been.calledWith( createPagesError( siteId ) );
				expect( dispatch ).to.not.have.been.calledWith( nextStep( siteId ) );
			} );

			it( 'should dispatch `createPagesError` if an error occurred with one of the requests', () => {
				handleFailure( { dispatch }, action );
				handleSuccess( { dispatch }, action );

				expect( dispatch ).to.have.been.calledWith( createPagesError( siteId ) );
			} );

			it( 'should dispatch `nextStep` if all requests completed successfully', () => {
				handleSuccess( { dispatch }, action );
				handleSuccess( { dispatch }, action );

				expect( dispatch ).to.have.been.calledWith( nextStep( siteId ) );
			} );
		} );

		describe( '#handleFailure()', () => {
			it( 'should not dispatch `createPagesError` if not all requests have completed', () => {
				handleFailure( { dispatch }, action );

				expect( dispatch ).to.not.have.been.calledWith( createPagesError( siteId ) );
			} );

			it( 'should dispatch `createPagesError` if an error occurred with one of the requests', () => {
				handleSuccess( { dispatch }, action );
				handleFailure( { dispatch }, action );

				expect( dispatch ).to.have.been.calledWith( createPagesError( siteId ) );
			} );
		} );
	} );

	describe( 'status', () => {
		const action = {
			type: WP_JOB_MANAGER_FETCH_SETUP_STATUS,
			siteId,
		};

		describe( '#fetchSetupStatus()', () => {
			it( 'should dispatch an HTTP request to the settings endpoint', () => {
				fetchSetupStatus( { dispatch }, action );

				expect( dispatch ).to.have.been.calledWith( http( {
					method: 'GET',
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					query: {
						path: '/wpjm/v1/status/run_page_setup',
					}
				}, action ) );
			} );
		} );

		describe( '#updateSetupStatus', () => {
			it( 'should dispatch `updateStatus`', () => {
				updateSetupStatus( { dispatch }, action, { data: false } );

				expect( dispatch ).to.have.been.calledWith( updateStatus( siteId, false ) );
			} );
		} );

		describe( '#fetchSetupStatusError', () => {
			it( 'should dispatch `fetchError`', () => {
				fetchSetupStatusError( { dispatch }, action );

				expect( dispatch ).to.have.been.calledWith( fetchStatusError( siteId ) );
			} );
		} );
	} );
} );
