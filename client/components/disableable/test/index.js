/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { Disabled } from '@wordpress/components';

/**
 * Internal dependencies
 */
import Disableable from '..';

describe( 'Disableable', () => {
	test( 'should contain a Disabled component', () => {
		const disableable = shallow( <Disableable disabled /> );
		expect( disableable.find( Disabled ) ).toHaveLength( 1 );
	} );

	test( 'should not contain a Disabled component', () => {
		const disableable = shallow( <Disableable disabled={ false } /> );
		expect( disableable.find( Disabled ) ).toHaveLength( 0 );
	} );
} );
