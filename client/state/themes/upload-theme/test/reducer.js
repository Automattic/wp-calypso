/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	uploadedThemeId,
	uploadError,
	progressLoaded,
	progressTotal,
	inProgress,
} from '../reducer';
import {
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_CLEAR,
	THEME_UPLOAD_PROGRESS,
	THEME_TRANSFER_STATUS_RECEIVE,
	THEME_TRANSFER_INITIATE_FAILURE,
	THEME_TRANSFER_STATUS_FAILURE,
	THEME_TRANSFER_INITIATE_PROGRESS,
	THEME_TRANSFER_INITIATE_REQUEST,
} from 'calypso/state/themes/action-types';

const themeId = 'twentysixteen';

const error = {
	type: 'error',
	cause: 'invalid theme',
};

const siteId = 2916284;

describe( 'uploadedThemeId', () => {
	test( 'should default to an empty object', () => {
		const state = uploadedThemeId( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	test( 'should contain theme id after successful upload', () => {
		const state = uploadedThemeId(
			{},
			{
				type: THEME_UPLOAD_SUCCESS,
				siteId,
				themeId,
			}
		);
		expect( state[ siteId ] ).to.deep.equal( themeId );
	} );

	test( 'should be empty after failed upload', () => {
		const state = uploadedThemeId(
			{},
			{
				type: THEME_UPLOAD_FAILURE,
				siteId,
				error,
			}
		);
		expect( state[ siteId ] ).to.be.undefined;
	} );

	test( 'should be empty after clear', () => {
		const state = uploadedThemeId(
			{
				siteId: themeId,
			},
			{
				type: THEME_UPLOAD_CLEAR,
				siteId,
			}
		);
		expect( state[ siteId ] ).to.be.undefined;
	} );

	test( 'should contain theme id after successful transfer with theme', () => {
		const state = uploadedThemeId(
			{},
			{
				type: THEME_TRANSFER_STATUS_RECEIVE,
				siteId,
				transferId: 89,
				status: 'complete',
				message: 'transfer complete',
				themeId,
			}
		);
		expect( state[ siteId ] ).to.deep.equal( themeId );
	} );
} );

describe( 'uploadError', () => {
	test( 'should default to an empty object', () => {
		const state = uploadError( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	test( 'should contain error after failed upload', () => {
		const state = uploadError(
			{},
			{
				type: THEME_UPLOAD_FAILURE,
				siteId,
				error,
			}
		);
		expect( state[ siteId ] ).to.deep.equal( error );
	} );

	test( 'should be empty after successful upload', () => {
		const state = uploadError(
			{},
			{
				type: THEME_UPLOAD_SUCCESS,
				siteId,
				themeId,
			}
		);
		expect( state[ siteId ] ).to.be.undefined;
	} );

	test( 'should be empty on clear', () => {
		const state = uploadError(
			{
				siteId: error,
			},
			{
				type: THEME_UPLOAD_CLEAR,
				siteId,
			}
		);
		expect( state[ siteId ] ).to.be.undefined;
	} );

	test( 'should contain error after failed transfer request', () => {
		const state = uploadError(
			{},
			{
				type: THEME_TRANSFER_INITIATE_FAILURE,
				siteId,
				error,
			}
		);
		expect( state[ siteId ] ).to.deep.equal( error );
	} );

	test( 'should contain error after failed transfer status request', () => {
		const state = uploadError(
			{},
			{
				type: THEME_TRANSFER_STATUS_FAILURE,
				siteId,
				transferId: 98,
				error,
			}
		);
		expect( state[ siteId ] ).to.deep.equal( error );
	} );
} );

describe( 'progressLoaded', () => {
	test( 'should default to an empty object', () => {
		const state = progressLoaded( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	test( 'should contain loaded amount after progress action', () => {
		const state = progressLoaded(
			{},
			{
				type: THEME_UPLOAD_PROGRESS,
				siteId,
				total: 100,
				loaded: 50,
			}
		);
		expect( state[ siteId ] ).to.equal( 50 );
	} );

	test( 'should be empty on clear', () => {
		const state = progressLoaded(
			{
				siteId: 50,
			},
			{
				type: THEME_UPLOAD_CLEAR,
				siteId,
			}
		);
		expect( state[ siteId ] ).to.be.undefined;
	} );

	test( 'should contain loaded amount after transfer progress action', () => {
		const state = progressLoaded(
			{},
			{
				type: THEME_TRANSFER_INITIATE_PROGRESS,
				siteId,
				total: 100,
				loaded: 50,
			}
		);
		expect( state[ siteId ] ).to.equal( 50 );
	} );
} );

describe( 'progressTotal', () => {
	test( 'should default to an empty object', () => {
		const state = progressLoaded( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	test( 'should contain total amount after progress action', () => {
		const state = progressTotal(
			{},
			{
				type: THEME_UPLOAD_PROGRESS,
				siteId,
				total: 100,
				loaded: 50,
			}
		);
		expect( state[ siteId ] ).to.equal( 100 );
	} );

	test( 'should be empty on clear', () => {
		const state = progressLoaded(
			{
				siteId: 100,
			},
			{
				type: THEME_UPLOAD_CLEAR,
				siteId,
			}
		);
		expect( state[ siteId ] ).to.be.undefined;
	} );

	test( 'should contain total amount after transfer progress action', () => {
		const state = progressTotal(
			{},
			{
				type: THEME_TRANSFER_INITIATE_PROGRESS,
				siteId,
				total: 100,
				loaded: 50,
			}
		);
		expect( state[ siteId ] ).to.equal( 100 );
	} );
} );

describe( 'inProgress', () => {
	test( 'should default to an empty object', () => {
		const state = inProgress( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	test( 'should be true on upload start', () => {
		const state = inProgress(
			{},
			{
				type: THEME_UPLOAD_START,
				siteId,
			}
		);
		expect( state[ siteId ] ).to.be.true;
	} );

	test( 'should not be true on upload success', () => {
		const state = inProgress(
			{},
			{
				type: THEME_UPLOAD_SUCCESS,
				siteId,
				themeId,
			}
		);
		expect( state[ siteId ] ).to.not.be.true;
	} );

	test( 'should not be true on upload failure', () => {
		const state = inProgress(
			{},
			{
				type: THEME_UPLOAD_FAILURE,
				siteId,
				error,
			}
		);
		expect( state[ siteId ] ).to.not.be.true;
	} );

	test( 'should not be true on clear', () => {
		const state = inProgress(
			{},
			{
				type: THEME_UPLOAD_CLEAR,
				siteId,
			}
		);
		expect( state[ siteId ] ).to.not.be.true;
	} );

	test( 'should be true on transfer initiate', () => {
		const state = inProgress(
			{},
			{
				type: THEME_TRANSFER_INITIATE_REQUEST,
				siteId,
			}
		);
		expect( state[ siteId ] ).to.be.true;
	} );

	test( 'should not be true on transfer status complete', () => {
		const state = inProgress(
			{},
			{
				type: THEME_TRANSFER_STATUS_RECEIVE,
				siteId,
				themeId,
				status: 'complete',
			}
		);
		expect( state[ siteId ] ).to.not.be.true;
	} );

	test( 'should be true on transfer status not-complete', () => {
		const state = inProgress(
			{},
			{
				type: THEME_TRANSFER_STATUS_RECEIVE,
				siteId,
				themeId,
				status: 'uploading',
			}
		);
		expect( state[ siteId ] ).to.be.true;
	} );

	test( 'should not be true on transfer status failure', () => {
		const state = inProgress(
			{},
			{
				type: THEME_TRANSFER_STATUS_FAILURE,
				siteId,
				error,
			}
		);
		expect( state[ siteId ] ).to.not.be.true;
	} );
} );
