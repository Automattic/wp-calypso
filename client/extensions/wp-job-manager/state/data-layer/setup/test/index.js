/** @format */

/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	announceFailure,
	createPages,
	fetchSetupStatus,
	handleCreateFailure,
	handleCreateSuccess,
	handleSetupFailure,
	handleSetupSuccess,
	saveSetupStatus,
} from '../';
import {
	WP_JOB_MANAGER_CREATE_PAGES,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS,
	WP_JOB_MANAGER_SAVE_SETUP_STATUS,
} from '../../../action-types';
import {
	createPagesError,
	fetchSetupStatusError,
	nextStep,
	updateSetupStatus,
} from '../../../setup/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice } from 'state/notices/actions';

const createPagesNotice = 'wpjm-create-pages';
const siteId = 101010;

describe( 'data layer', () => {
	describe( 'pages', () => {
		const titles = [ 'Page 1', 'Page 2' ];
		const action = {
			type: WP_JOB_MANAGER_CREATE_PAGES,
			siteId,
			titles,
		};

		describe( '#createPages()', () => {
			test( 'should dispatch `removeNotice`', () => {
				expect( createPages( action ) ).toContainEqual( removeNotice( 'wpjm-create-pages' ) );
			} );

			test( 'should dispatch one HTTP request for each title', () => {
				for ( const title of titles ) {
					expect( createPages( action ) ).toContainEqual(
						http(
							{
								method: 'POST',
								path: `/sites/${ siteId }/posts/new`,
								body: { type: 'page', title },
							},
							action
						)
					);
				}
			} );
		} );

		describe( '#announceFailure()', () => {
			test( 'should dispatch `createPagesError`', () => {
				expect( announceFailure( siteId ) ).toContainEqual( createPagesError( siteId ) );
			} );

			test( 'should dispatch `errorNotice`', () => {
				expect( announceFailure( siteId ) ).toContainEqual(
					errorNotice( translate( 'There was a problem creating the page(s). Please try again.' ), {
						id: createPagesNotice,
					} )
				);
			} );
		} );

		describe( '#handleCreateSuccess()', () => {
			test( 'should not dispatch `createPagesError` or `nextStep` if not all requests have completed', () => {
				createPages( action );
				expect( handleCreateSuccess( action ) ).toBeUndefined();
			} );

			test( 'should dispatch `createPagesError` if an error occurred with one of the requests', () => {
				createPages( action );
				expect( handleCreateFailure( action ) ).toBeUndefined();
				expect( handleCreateSuccess( action ) ).toContainEqual( createPagesError( siteId ) );
			} );

			test( 'should dispatch `nextStep` if all requests completed successfully', () => {
				createPages( action );
				expect( handleCreateSuccess( action ) ).toBeUndefined();
				expect( handleCreateSuccess( action ) ).toEqual( nextStep( siteId ) );
			} );
		} );

		describe( '#handleCreateFailure()', () => {
			test( 'should not dispatch `createPagesError` if not all requests have completed', () => {
				createPages( action );
				expect( handleCreateFailure( action ) ).toBeUndefined();
			} );

			test( 'should dispatch `createPagesError` if an error occurred with one of the requests', () => {
				createPages( action );
				expect( handleCreateSuccess( action ) ).toBeUndefined();
				expect( handleCreateFailure( action ) ).toContainEqual( createPagesError( siteId ) );
			} );
		} );
	} );

	describe( 'status', () => {
		describe( 'fetching', () => {
			const action = {
				type: WP_JOB_MANAGER_FETCH_SETUP_STATUS,
				siteId,
			};

			describe( '#fetchSetupStatus()', () => {
				test( 'should dispatch an HTTP request to the status endpoint', () => {
					expect( fetchSetupStatus( action ) ).toEqual(
						http(
							{
								method: 'GET',
								path: `/jetpack-blogs/${ siteId }/rest-api/`,
								query: { path: '/wpjm/v1/status/run_page_setup' },
							},
							action
						)
					);
				} );
			} );

			describe( '#handleSetupSuccess', () => {
				test( 'should dispatch `updateSetupStatus`', () => {
					expect( handleSetupSuccess( action, { data: false } ) ).toEqual(
						updateSetupStatus( siteId, false )
					);
				} );
			} );

			describe( '#handleSetupFailure', () => {
				test( 'should dispatch `fetchSetupStatusError`', () => {
					expect( handleSetupFailure( action ) ).toEqual( fetchSetupStatusError( siteId ) );
				} );
			} );
		} );

		describe( '#saveSetupStatus()', () => {
			test( 'should dispatch an HTTP POST request to the status endpoint', () => {
				const saveAction = {
					type: WP_JOB_MANAGER_SAVE_SETUP_STATUS,
					setupStatus: false,
					siteId,
				};

				expect( saveSetupStatus( saveAction ) ).toEqual(
					http(
						{
							method: 'POST',
							path: `/jetpack-blogs/${ siteId }/rest-api/`,
							query: {
								body: JSON.stringify( false ),
								json: true,
								path: '/wpjm/v1/status/run_page_setup',
							},
						},
						saveAction
					)
				);
			} );
		} );
	} );
} );
