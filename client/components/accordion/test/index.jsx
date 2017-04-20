/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

describe( 'Accordion', function() {
	let Accordion, AccordionStatus;

	useFakeDom();
	before( () => {
		Accordion = require( '../' );
		AccordionStatus = require( '../status' );
	} );

	it( 'should render as expected with a title and content', function() {
		const wrapper = shallow( <Accordion title="Section">Content</Accordion> );

		expect( wrapper ).to.have.className( 'accordion' );
		expect( wrapper ).to.have.state( 'isExpanded' ).be.false;
		expect( wrapper ).to.not.have.className( 'has-icon' );
		expect( wrapper ).to.not.have.className( 'has-subtitle' );
		expect( wrapper ).to.not.have.descendants( '.accordion__icon' );
		expect( wrapper.find( '.accordion__title' ) ).to.have.text( 'Section' );
		expect( wrapper ).to.not.have.descendants( '.accordion__subtitle' );
		expect( wrapper ).to.not.have.descendants( '.accordion__icon' );
		expect( wrapper.find( '.accordion__content' ) ).to.have.text( 'Content' );
	} );

	it( 'should accept an icon prop to be rendered', function() {
		const wrapper = shallow( <Accordion title="Section" icon={ <Gridicon icon="time" /> }>Content</Accordion> );

		expect( wrapper ).to.have.className( 'has-icon' );
		expect( wrapper.find( '.accordion__icon' ) ).to.have.descendants( Gridicon );
	} );

	it( 'should accept a subtitle prop to be rendered aside the title', function() {
		const wrapper = shallow( <Accordion title="Section" subtitle="Subtitle">Content</Accordion> );

		expect( wrapper ).to.have.className( 'has-subtitle' );
		expect( wrapper.find( '.accordion__subtitle' ) ).to.have.text( 'Subtitle' );
	} );

	it( 'should accept a status prop to be rendered in the toggle', () => {
		const status = { type: 'error', text: 'Warning!', url: 'https://wordpress.com', position: 'top left', onClick() {} };
		const wrapper = shallow( <Accordion title="Section" status={ status }>Content</Accordion> );

		expect( wrapper ).to.have.className( 'has-status' );
		expect( wrapper.find( AccordionStatus ).props() ).to.eql( status );
	} );

	context( 'events', () => {
		function simulateClick( wrapper ) {
			wrapper.find( '.accordion__toggle' ).simulate( 'click' );
		}

		it( 'should toggle when clicked', function() {
			const wrapper = shallow( <Accordion title="Section">Content</Accordion> );

			simulateClick( wrapper );

			expect( wrapper ).to.have.state( 'isExpanded' ).be.true;
		} );

		it( 'should accept an onToggle function handler to be invoked when toggled', function( done ) {
			const wrapper = shallow( <Accordion title="Section" onToggle={ finishTest }>Content</Accordion> );

			simulateClick( wrapper );

			function finishTest( isExpanded ) {
				expect( isExpanded ).to.be.true;

				process.nextTick( function() {
					expect( wrapper ).to.have.state( 'isExpanded' ).be.true;
					done();
				} );
			}
		} );

		it( 'should always use the isExpanded prop, if specified', function( done ) {
			const wrapper = shallow(
				<Accordion isExpanded={ true } title="Section" onToggle={ finishTest }>Content</Accordion>
			);

			simulateClick( wrapper );

			function finishTest( isExpanded ) {
				expect( isExpanded ).to.be.false;

				process.nextTick( function() {
					expect( wrapper ).to.have.state( 'isExpanded' ).be.false;
					done();
				} );
			}
		} );
	} );
} );
