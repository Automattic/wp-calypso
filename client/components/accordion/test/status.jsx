/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import Gridicon from 'components/gridicon';
import React from 'react';

/**
 * Internal dependencies
 */
import AccordionStatus from '../status';
import Tooltip from 'components/tooltip';

describe( 'AccordionStatus', () => {
	test( 'should render with explicit props', () => {
		const status = {
			type: 'error',
			text: 'Warning!',
			url: 'https://wordpress.com',
			position: 'top left',
		};
		const wrapper = shallow( <AccordionStatus { ...status } /> );

		expect( wrapper.find( 'a' ) ).toHaveProp( 'href', 'https://wordpress.com' );
		expect( wrapper.find( 'a' ) ).toHaveClassName( 'is-error' );
		expect( wrapper.find( Gridicon ) ).toHaveProp( 'icon', 'notice' );
		expect( wrapper.find( Tooltip ) ).toHaveProp( 'children', 'Warning!' );
		expect( wrapper.find( Tooltip ) ).toHaveProp( 'position', 'top left' );
	} );

	test( 'should render with default props', () => {
		const wrapper = shallow( <AccordionStatus /> );

		expect( wrapper.find( 'a' ) ).toHaveProp( 'href', undefined );
		expect( wrapper.find( 'a' ) ).toHaveClassName( 'is-info' );
		expect( wrapper.find( Gridicon ) ).toHaveProp( 'icon', 'info' );
		expect( wrapper ).not.toContainMatchingElement( Tooltip );
	} );

	test( 'should show tooltip on hover', () => {
		const wrapper = shallow( <AccordionStatus text="Warning!" /> );

		expect( wrapper.find( Tooltip ) ).toHaveProp( 'isVisible', false );
		expect( wrapper.find( Tooltip ) ).toHaveProp( 'position', 'top' );

		wrapper.find( 'a' ).simulate( 'mouseEnter' );
		expect( wrapper.find( Tooltip ) ).toHaveProp( 'isVisible', true );

		wrapper.find( 'a' ).simulate( 'mouseLeave' );
		expect( wrapper.find( Tooltip ) ).toHaveProp( 'isVisible', false );
	} );

	test( 'should call onClick callback', () => {
		const spy = jest.fn();
		const wrapper = shallow( <AccordionStatus onClick={ spy } /> );

		wrapper.find( 'a' ).simulate( 'click' );
		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );
} );
