/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import Version from 'components/version';

describe( 'Version', () => {
	it( 'returns null with no version prop', () => {
		const wrapper = shallow( <Version version={ false } /> );

		expect( wrapper.type() ).to.equal.null;
	} );
} );
