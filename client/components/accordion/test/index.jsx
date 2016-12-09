/**
 * External dependencies
 */
import { expect } from 'chai';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { shallow, mount } from 'enzyme';
import createReactTapEventPlugin from 'react-tap-event-plugin';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import Gridicon from 'components/gridicon';
import Accordion from '../';

describe( 'Accordion', function() {
	before( () => {
		// Unfortunately, there is no corresponding teardown for this plugin
		createReactTapEventPlugin();
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

	context( 'events', () => {
		useFakeDom();

		function simulateTouchTap( wrapper ) {
			TestUtils.Simulate.touchTap( ReactDom.findDOMNode( wrapper.find( '.accordion__toggle' ).node ) );
		}

		it( 'should toggle when clicked', function() {
			const wrapper = mount( <Accordion title="Section">Content</Accordion> );

			simulateTouchTap( wrapper );

			expect( wrapper ).to.have.state( 'isExpanded' ).be.true;
		} );

		it( 'should accept an onToggle function handler to be invoked when toggled', function( done ) {
			const wrapper = mount( <Accordion title="Section" onToggle={ finishTest }>Content</Accordion> );

			simulateTouchTap( wrapper );

			function finishTest( isExpanded ) {
				expect( isExpanded ).to.be.true;

				process.nextTick( function() {
					expect( wrapper ).to.have.state( 'isExpanded' ).be.true;
					done();
				} );
			}
		} );

		it( 'should always use the initialExpanded prop, if specified', function( done ) {
			const wrapper = mount(
				<Accordion initialExpanded={ true } title="Section" onToggle={ finishTest }>Content</Accordion>
			);

			simulateTouchTap( wrapper );

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
