/** @format */

/**
 * External Dependencies
 */
import { expect } from 'chai';

/**
 * Internal Dependencies
 */
import reducer from '../reducer';
import { loadTrackingTool } from '../actions';

describe( 'reducer', () => {
	test( 'should turn analytics ON for the specified tracking tool', () => {
		const state = reducer( {}, loadTrackingTool( 'trackingToolName' ) );

		expect( state ).to.eql( { trackingToolName: true } );
	} );
} );
