/**
 * External dependencies
 */
import { expect } from 'chai';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
const Accordion = require( '../' );

describe( 'index', function() {
	require( 'react-tap-event-plugin' )();
	require( 'test/helpers/use-fake-dom' )();

	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	it( 'should render as expected with a title and content', function() {
		const tree = TestUtils.renderIntoDocument( <Accordion title="Section">Content</Accordion> ),
			node = ReactDom.findDOMNode( tree );

		expect( node.className ).to.equal( 'accordion' );
		expect( tree.state.isExpanded ).to.not.be.ok;
		expect( node.querySelector( '.accordion__header:not( .has-icon ):not( .has-subtitle )' ) ).to.be.an.instanceof( window.Element );
		expect( node.querySelector( '.accordion__icon' ) ).to.be.null;
		expect( node.querySelector( '.accordion__title' ).textContent ).to.equal( 'Section' );
		expect( node.querySelector( '.accordion__subtitle' ) ).to.be.null;
		expect( ReactDom.findDOMNode( tree.refs.content ).textContent ).to.equal( 'Content' );
	} );

	it( 'should accept an icon prop to be rendered as a noticon', function() {
		const tree = TestUtils.renderIntoDocument( <Accordion title="Section" icon="time">Content</Accordion> ),
			node = ReactDom.findDOMNode( tree );

		expect( node.querySelector( '.accordion__header.has-icon:not( .has-subtitle )' ) ).to.be.an.instanceof( window.Element );
		expect( node.querySelector( '.accordion__icon' ) ).to.be.an.instanceof( window.Element );
	} );

	it( 'should accept a subtitle prop to be rendered aside the title', function() {
		const tree = TestUtils.renderIntoDocument( <Accordion title="Section" subtitle="Subtitle">Content</Accordion> ),
			node = ReactDom.findDOMNode( tree );

		expect( node.querySelector( '.accordion__header.has-subtitle:not( .has-icon )' ) ).to.be.an.instanceof( window.Element );
		expect( node.querySelector( '.accordion__subtitle' ).textContent ).to.equal( 'Subtitle' );
	} );

	it( 'should toggle when clicked', function() {
		const tree = TestUtils.renderIntoDocument( <Accordion title="Section">Content</Accordion> );

		TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'accordion__toggle' ) ) );

		expect( tree.state.isExpanded ).to.be.ok;
	} );

	it( 'should accept an onToggle function handler to be invoked when toggled', function( done ) {
		const tree = TestUtils.renderIntoDocument( <Accordion title="Section" onToggle={ finishTest }>Content</Accordion> );

		TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'accordion__toggle' ) ) );

		function finishTest( isExpanded ) {
			expect( isExpanded ).to.be.ok;

			process.nextTick( function() {
				expect( tree.state.isExpanded ).to.be.ok;
				done();
			} );
		}
	} );

	it( 'should always use the initialExpanded prop, if specified', function( done ) {
		const tree = TestUtils.renderIntoDocument(
			<Accordion initialExpanded={ true } title="Section" onToggle={ finishTest }>Content</Accordion>
		);

		TestUtils.Simulate.touchTap( ReactDom.findDOMNode( TestUtils.findRenderedDOMComponentWithClass( tree, 'accordion__toggle' ) ) );

		function finishTest( isExpanded ) {
			expect( isExpanded ).to.not.be.ok;

			process.nextTick( function() {
				expect( tree.state.isExpanded ).to.not.be.ok;
				done();
			} );
		}
	} );
} );
