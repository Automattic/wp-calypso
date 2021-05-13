/**
 * External dependencies
 */
import React from 'react';

import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import GSuiteLearnMore from '../';

describe( 'GSuiteLearnMore', () => {
	test( 'it renders GSuiteLearnMore with no props', () => {
		const tree = renderer.create( <GSuiteLearnMore /> ).toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
