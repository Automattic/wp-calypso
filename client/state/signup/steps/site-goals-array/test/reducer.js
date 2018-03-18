/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { SIGNUP_STEPS_SITE_GOALS_ARRAY_SET } from 'state/action-types';
const shareOption = <div>Share Option</div>;

describe( 'reducer', () => {
	test( 'should update the site goals array', () => {
		expect(
			reducer(
				{},
				{
					type: SIGNUP_STEPS_SITE_GOALS_ARRAY_SET,
					siteGoalsArray: [ shareOption ],
				}
			)
		).to.be.eql( [ shareOption ] );
	} );
} );
