/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	errors,
	items,
} from '../reducer';
import {
	REWIND_STATUS_ERROR,
	REWIND_STATUS_UPDATE,
} from 'state/action-types';

describe( '#errors()', () => {
	const siteId = 987;

	const errorAction = deepFreeze( {
		type: REWIND_STATUS_ERROR,
		siteId,
		error: {
			error: 'unknown_blog',
			message: 'Unknown blog'
		},
	} );

	it( 'should update site error', () => {
		const state = errors( undefined, errorAction );
		expect( state[ siteId ] ).to.deep.equal( errorAction.error );
	} );

	it( 'should preserve other site errors', () => {
		const prevState = deepFreeze( {
			123456: {
				error: 'an_error',
				message: 'This is an error message.'
			}
		} );

		const state = errors( prevState, errorAction );
		expect( state[ 123456 ] ).to.deep.equal( prevState[ 123456 ] );
	} );
} );

describe( '#items()', () => {
	const siteId = 987;
	const updateAction = deepFreeze( {
		type: REWIND_STATUS_UPDATE,
		siteId,
		status: {
			active: true,
			firstBackupDate: '2017-04-19 12:00:00',
			isPressable: false,
			plan: 'jetpack-business',
		},
	} );

	it( 'should update site item', () => {
		const state = items( undefined, updateAction );
		expect( state[ siteId ] ).to.deep.equal( updateAction.status );
	} );

	it( 'should preserve other site items', () => {
		const prevState = deepFreeze( {
			123456: {
				active: false,
				firstBackupDate: '',
				isPressable: false,
				plan: 'jetpack-free',
			}
		} );

		const state = items( prevState, updateAction );
		expect( state[ 123456 ] ).to.deep.equal( prevState[ 123456 ] );
	} );
} );
