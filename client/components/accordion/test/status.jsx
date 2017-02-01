/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'AccordionStatus', function() {
	let AccordionStatus, Tooltip;

	useFakeDom();
	before( () => {
		AccordionStatus = require( '../status' );
		Tooltip = require( 'components/tooltip' );
	} );

	it( 'should render with explicit props', () => {
		const status = { type: 'error', text: 'Warning!', url: 'https://wordpress.com', position: 'top left' };
		const wrapper = shallow( <AccordionStatus { ...status } /> );

		expect( wrapper ).to.have.prop( 'href' ).equal( 'https://wordpress.com' );
		expect( wrapper ).to.have.className( 'is-error' );
		expect( wrapper.find( Gridicon ) ).to.have.prop( 'icon' ).equal( 'notice' );
		expect( wrapper.find( Tooltip ) ).to.have.prop( 'children' ).equal( 'Warning!' );
		expect( wrapper.find( Tooltip ) ).to.have.prop( 'position' ).equal( 'top left' );
	} );

	it( 'should render with default props', () => {
		const wrapper = shallow( <AccordionStatus /> );

		expect( wrapper ).to.not.have.prop( 'href' );
		expect( wrapper ).to.have.className( 'is-info' );
		expect( wrapper.find( Gridicon ) ).to.have.prop( 'icon' ).equal( 'info' );
		expect( wrapper ).to.not.have.descendants( Tooltip );
	} );

	it( 'should show tooltip on hover', () => {
		const wrapper = shallow( <AccordionStatus text="Warning!" /> );

		expect( wrapper.find( Tooltip ) ).to.not.have.prop( 'isVisible' );
		expect( wrapper.find( Tooltip ) ).to.have.prop( 'position' ).equal( 'top' );

		wrapper.simulate( 'mouseEnter' );

		expect( wrapper.find( Tooltip ) ).to.have.prop( 'isVisible' ).be.true;

		wrapper.simulate( 'mouseLeave' );

		expect( wrapper.find( Tooltip ) ).to.have.prop( 'isVisible' ).be.false;
	} );

	it( 'should call onClick callback', () => {
		const spy = sinon.spy();
		const wrapper = shallow( <AccordionStatus onClick={ spy } /> );

		wrapper.simulate( 'click' );

		expect( spy ).to.have.been.calledOnce;
	} );
} );
