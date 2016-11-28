/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	THEME_UPLOAD_START,
	THEME_UPLOAD_SUCCESS,
	THEME_UPLOAD_FAILURE,
	THEME_UPLOAD_CLEAR,
	THEME_UPLOAD_PROGRESS,
} from 'state/action-types';
import {
	uploadedTheme,
	uploadError,
	progressLoaded,
	progressTotal,
	inProgress,
} from '../reducer';

const theme = {
	id: 'twentysixteen',
	name: 'Twenty Sixteen',
	author: 'the WordPress team',
	screenshot: 'https://i0.wp.com/theme.wordpress.com/wp-content/themes/pub/twentysixteen/screenshot.png',
	stylesheet: 'pub/twentysixteen',
	author_uri: 'https://wordpress.org/'
};

const error = {
	type: 'error',
	cause: 'invalid theme',
};

const siteId = 2916284;

describe( 'uploadedTheme', () => {
	it( 'should default to an empty object', () => {
		const state = uploadedTheme( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	it( 'should contain theme details after successful upload', () => {
		const state = uploadedTheme( {}, {
			type: THEME_UPLOAD_SUCCESS,
			siteId,
			theme,
		} );
		expect( state[ siteId ] ).to.deep.equal( theme );
	} );

	it( 'should be empty after failed upload', () => {
		const state = uploadedTheme( {}, {
			type: THEME_UPLOAD_FAILURE,
			siteId,
			error,
		} );
		expect( state[ siteId ] ).to.be.undefined;
	} );

	it( 'should be empty after clear', () => {
		const state = uploadedTheme( {
			siteId: theme,
		}, {
			type: THEME_UPLOAD_CLEAR,
			siteId,
		} );
		expect( state[ siteId ] ).to.be.undefined;
	} );
} );

describe( 'uploadError', () => {
	it( 'should default to an empty object', () => {
		const state = uploadError( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	it( 'should contain error after failed upload', () => {
		const state = uploadError( {}, {
			type: THEME_UPLOAD_FAILURE,
			siteId,
			error,
		} );
		expect( state[ siteId ] ).to.deep.equal( error );
	} );

	it( 'should be empty after successful upload', () => {
		const state = uploadError( {}, {
			type: THEME_UPLOAD_SUCCESS,
			siteId,
			theme,
		} );
		expect( state[ siteId ] ).to.be.undefined;
	} );

	it( 'should be empty on clear', () => {
		const state = uploadError( {
			siteId: error,
		}, {
			type: THEME_UPLOAD_CLEAR,
			siteId,
		} );
		expect( state[ siteId ] ).to.be.undefined;
	} );
} );

describe( 'progressLoaded', () => {
	it( 'should default to an empty object', () => {
		const state = progressLoaded( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	it( 'should contain loaded amount after progress action', () => {
		const state = progressLoaded( {}, {
			type: THEME_UPLOAD_PROGRESS,
			siteId,
			total: 100,
			loaded: 50,
		} );
		expect( state[ siteId ] ).to.equal( 50 );
	} );

	it( 'should be empty on clear', () => {
		const state = progressLoaded( {
			siteId: 50,
		}, {
			type: THEME_UPLOAD_CLEAR,
			siteId,
		} );
		expect( state[ siteId ] ).to.be.undefined;
	} );
} );

describe( 'progressTotal', () => {
	it( 'should default to an empty object', () => {
		const state = progressLoaded( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	it( 'should contain total amount after progress action', () => {
		const state = progressTotal( {}, {
			type: THEME_UPLOAD_PROGRESS,
			siteId,
			total: 100,
			loaded: 50,
		} );
		expect( state[ siteId ] ).to.equal( 100 );
	} );

	it( 'should be empty on clear', () => {
		const state = progressLoaded( {
			siteId: 100,
		}, {
			type: THEME_UPLOAD_CLEAR,
			siteId,
		} );
		expect( state[ siteId ] ).to.be.undefined;
	} );
} );

describe( 'inProgress', () => {
	it( 'should default to an empty object', () => {
		const state = inProgress( undefined, {} );
		expect( state ).to.deep.equal( {} );
	} );

	it( 'should be true on upload start', () => {
		const state = inProgress( {}, {
			type: THEME_UPLOAD_START,
			siteId,
		} );
		expect( state[ siteId ] ).to.be.true;
	} );

	it( 'should not be true on upload success', () => {
		const state = inProgress( {}, {
			type: THEME_UPLOAD_SUCCESS,
			siteId,
			theme,
		} );
		expect( state[ siteId ] ).to.not.be.true;
	} );

	it( 'should not be true on upload failure', () => {
		const state = inProgress( {}, {
			type: THEME_UPLOAD_FAILURE,
			siteId,
			error,
		} );
		expect( state[ siteId ] ).to.not.be.true;
	} );

	it( 'should not be true on clear', () => {
		const state = inProgress( {}, {
			type: THEME_UPLOAD_CLEAR,
			siteId,
		} );
		expect( state[ siteId ] ).to.not.be.true;
	} );
} );
