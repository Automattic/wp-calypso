/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import { assert, expect } from 'chai';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
const Card = require( '../' );
const CompactCard = require( '../compact' );

describe( 'Card', function() {
	require( 'test/helpers/use-fake-dom' )();

	// it should have a class of card
	it( 'should have card class', function() {
		const card = shallow( <Card /> );
		assert.equal( 1, card.find( '.card' ).length );
	} );

	// check that content within a card renders correctly
	it( 'should accept content containing a title and paragraph', function() {
		const tree = TestUtils.renderIntoDocument( <Card>This is a card</Card> ),
			node = ReactDom.findDOMNode( tree );

		expect( ReactDom.findDOMNode( tree.refs.content ).textContent ).to.equal( 'This is a card' );
	} );

	// check for a prop of compact set to true




} );

describe( 'CompactCard', function() {

	// it should have a class of is-compact
	it( 'should have card and is-compact class', function() {
		const compactCard = shallow( <CompactCard /> );
		assert.equal( 1, compactCard.find( '.is-compact' ).length );
	} );

} );