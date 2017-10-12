/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import Gridicon from 'gridicons';
import React from 'react';

describe( 'Accordion', () => {
	let Accordion, AccordionStatus;

	beforeAll( () => {
		Accordion = require( '../' );
		AccordionStatus = require( '../status' );
	} );

	test( 'should render as expected with a title and content', () => {
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

	test( 'should accept an icon prop to be rendered', () => {
		const wrapper = shallow(
			<Accordion title="Section" icon={ <Gridicon icon="time" /> }>
				Content
			</Accordion>
		);

		expect( wrapper ).to.have.className( 'has-icon' );
		expect( wrapper.find( '.accordion__icon' ) ).to.have.descendants( Gridicon );
	} );

	test( 'should accept a subtitle prop to be rendered aside the title', () => {
		const wrapper = shallow(
			<Accordion title="Section" subtitle="Subtitle">
				Content
			</Accordion>
		);

		expect( wrapper ).to.have.className( 'has-subtitle' );
		expect( wrapper.find( '.accordion__subtitle' ) ).to.have.text( 'Subtitle' );
	} );

	test( 'should accept a status prop to be rendered in the toggle', () => {
		const status = {
			type: 'error',
			text: 'Warning!',
			url: 'https://wordpress.com',
			position: 'top left',
			onClick() {},
		};
		const wrapper = shallow(
			<Accordion title="Section" status={ status }>
				Content
			</Accordion>
		);

		expect( wrapper ).to.have.className( 'has-status' );
		expect( wrapper.find( AccordionStatus ).props() ).to.eql( status );
	} );

	describe( 'events', () => {
		function simulateClick( wrapper ) {
			wrapper.find( '.accordion__toggle' ).simulate( 'click' );
		}

		test( 'should toggle when clicked', () => {
			const wrapper = shallow( <Accordion title="Section">Content</Accordion> );

			simulateClick( wrapper );

			expect( wrapper ).to.have.state( 'isExpanded' ).be.true;
		} );

		test( 'should accept an onToggle function handler to be invoked when toggled', done => {
			const wrapper = shallow(
				<Accordion title="Section" onToggle={ finishTest }>
					Content
				</Accordion>
			);

			simulateClick( wrapper );

			function finishTest( isExpanded ) {
				expect( isExpanded ).to.be.true;

				process.nextTick( function() {
					expect( wrapper ).to.have.state( 'isExpanded' ).be.true;
					done();
				} );
			}
		} );

		test( 'should always use the initialExpanded prop, if specified', done => {
			const wrapper = shallow(
				<Accordion initialExpanded={ true } title="Section" onToggle={ finishTest }>
					Content
				</Accordion>
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
