/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import PopoverMenuItem from 'calypso/components/popover/menu-item';
import ExternalLink from 'calypso/components/external-link';

describe( 'PopoverMenuItem', () => {
	test( 'should be a button by default', () => {
		const wrapper = shallow( <PopoverMenuItem /> );
		expect( wrapper.type() ).toEqual( 'button' );
	} );

	test( 'should be a div if the itemComponent prop is provided', () => {
		const wrapper = shallow( <PopoverMenuItem itemComponent={ 'div' } /> );
		expect( wrapper.type() ).toEqual( 'div' );
	} );

	test( 'should be a link if the href prop is set', () => {
		const wrapper = shallow( <PopoverMenuItem href={ 'xyz' } /> );
		expect( wrapper.type() ).toEqual( 'a' );
	} );

	test( 'should be an ExternalLink if the isExternalLink prop is true and the href prop is set', () => {
		const wrapper = shallow( <PopoverMenuItem isExternalLink={ true } href={ 'xyz' } /> );
		expect( wrapper.type() ).toEqual( ExternalLink );
	} );
} );
