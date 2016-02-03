/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer from '../reducer';

describe( 'reducer ui media', () => {
	it( 'never loads persisted state', () => {
		const state = reducer( { advanced: true }, { type: DESERIALIZE } );
		expect( state.advanced ).to.eql( false );
	} );
	it( 'never persists state', () => {
		const state = reducer( { advanced: true }, { type: SERIALIZE } );
		expect( state.advanced ).to.eql( false );
	} );
} );
