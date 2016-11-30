/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { render } from 'enzyme';

/**
 * Internal dependencies
 */
import FollowButton from '../button';

describe( 'FollowButton', () => {
	it( 'should apply a custom follow label', () => {
		const wrapper = render( <FollowButton followLabel="Follow Tag" /> );
		expect( wrapper.text() ).to.contain( 'Follow Tag' );
	} );
} );
