/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getSiteGoalsArray } from '../selectors';
const shareOption = <div>Share Option</div>;

describe( 'selectors', () => {
	test( 'should return empty string as a default state', () => {
		expect( getSiteGoalsArray( { signup: undefined } ) ).to.be.eql( [] );
	} );

	test( 'should return site goals array from the state', () => {
		expect(
			getSiteGoalsArray( {
				signup: {
					steps: {
						siteGoalsArray: [ shareOption ],
					},
				},
			} )
		).to.be.eql( [ shareOption ] );
	} );
} );
