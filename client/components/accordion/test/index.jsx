/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { Gridicon } from '@automattic/components';
import React from 'react';
import { shallow } from 'enzyme';

describe( 'Accordion', () => {
	let Accordion, AccordionStatus;

	beforeAll( () => {
		Accordion = require( '../' );
		AccordionStatus = require( '../status' );
	} );

	test( 'should render as expected with a title but no content when initially closed', () => {
		const wrapper = shallow( <Accordion title="Section">Content</Accordion> );

		expect( wrapper.hasClass( 'accordion' ) ).toBe( true );
		expect( wrapper.state( 'isExpanded' ) ).toBe( false );
		expect( wrapper.hasClass( 'has-icon' ) ).toBe( false );
		expect( wrapper.hasClass( 'has-subtitle' ) ).toBe( false );
		expect( wrapper.find( '.accordion__icon' ) ).toHaveLength( 0 );
		expect( wrapper.find( '.accordion__title' ).text() ).toBe( 'Section' );
		expect( wrapper.find( '.accordion__subtitle' ) ).toHaveLength( 0 );
		expect( wrapper.find( '.accordion__icon' ) ).toHaveLength( 0 );
		expect( wrapper.state( 'hasExpanded' ) ).toBe( false );
		expect( wrapper.find( '.accordion__content' ) ).toHaveLength( 0 );
	} );

	test( 'should accept an icon prop to be rendered', () => {
		const wrapper = shallow(
			<Accordion title="Section" icon={ <Gridicon icon="time" /> }>
				Content
			</Accordion>
		);

		expect( wrapper.hasClass( 'has-icon' ) ).toBe( true );
		expect( wrapper.find( '.accordion__icon' ).find( Gridicon ) ).toHaveLength( 1 );
	} );

	test( 'should accept a subtitle prop to be rendered aside the title', () => {
		const wrapper = shallow(
			<Accordion title="Section" subtitle="Subtitle">
				Content
			</Accordion>
		);

		expect( wrapper.hasClass( 'has-subtitle' ) ).toBe( true );
		expect( wrapper.find( '.accordion__subtitle' ).text() ).toBe( 'Subtitle' );
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

		expect( wrapper.hasClass( 'has-status' ) ).toBe( true );
		expect( wrapper.find( AccordionStatus ).props() ).toEqual( status );
	} );

	describe( 'events', () => {
		function simulateClick( wrapper ) {
			return wrapper.find( '.accordion__toggle' ).simulate( 'click' );
		}

		test( 'should toggle when clicked', () => {
			const wrapper = shallow( <Accordion title="Section">Content</Accordion> );

			simulateClick( wrapper );

			expect( wrapper.state( 'isExpanded' ) ).toBe( true );
			expect( wrapper.state( 'hasExpanded' ) ).toBe( true );
			expect( wrapper.find( '.accordion__content' ).text() ).toBe( 'Content' );
		} );

		test( 'should accept an onToggle function handler to be invoked when toggled', () => {
			const toggleSpy = jest.fn();
			const wrapper = shallow(
				<Accordion title="Section" onToggle={ toggleSpy }>
					Content
				</Accordion>
			);

			simulateClick( wrapper );

			expect( toggleSpy ).toHaveBeenCalledTimes( 1 );
			expect( toggleSpy ).toHaveBeenCalledWith( true );
			expect( wrapper.state( 'isExpanded' ) ).toBe( true );
		} );

		test( 'should always use the initialExpanded prop, if specified', () => {
			const toggleSpy = jest.fn();
			const wrapper = shallow(
				<Accordion initialExpanded={ true } title="Section" onToggle={ toggleSpy }>
					Content
				</Accordion>
			);

			simulateClick( wrapper );

			expect( toggleSpy ).toHaveBeenCalledTimes( 1 );
			expect( toggleSpy ).toHaveBeenCalledWith( false );
			expect( wrapper.state( 'isExpanded' ) ).toBe( false );
		} );

		test( 'should render content when initially open', () => {
			const wrapper = shallow(
				<Accordion initialExpanded={ true } title="Section">
					Content
				</Accordion>
			);
			expect( wrapper.state( 'isExpanded' ) ).toBe( true );
			expect( wrapper.state( 'hasExpanded' ) ).toBe( true );
			expect( wrapper.find( '.accordion__content' ).text() ).toBe( 'Content' );
		} );

		test( 'should render content when forced', () => {
			const wrapper = shallow( <Accordion title="Section">Content</Accordion> );
			expect( wrapper.state( 'isExpanded' ) ).toBe( false );
			expect( wrapper.state( 'hasExpanded' ) ).toBe( false );
			expect( wrapper.find( '.accordion__content' ) ).toHaveLength( 0 );

			wrapper.setProps( { forceExpand: true } );
			expect( wrapper.state( 'isExpanded' ) ).toBe( false );
			expect( wrapper.state( 'hasExpanded' ) ).toBe( true );
			expect( wrapper.find( '.accordion__content' ).text() ).toBe( 'Content' );
		} );
	} );
} );
