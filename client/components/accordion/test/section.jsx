/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	chaiEnzyme = require( 'chai-enzyme' ),
	React = require( 'react' ),
	shallow = require( 'enzyme' ).shallow;

chai.use( chaiEnzyme() );

/**
 * Internal dependencies
 */
var AccordionSection = require( '../section' );

describe( 'AccordionSection', function() {
	it( 'renders with expected css class and children', function() {
		const childNode = <span id="target">foo</span>;
		const wrapper = shallow( <AccordionSection>{ childNode }</AccordionSection> );
		expect( wrapper ).to.have.className( 'accordion__section' )
			.and.contain( childNode );
	} );

	it( 'accepts a className property, which is added to the class for the component', function() {
		const wrapper = shallow( <AccordionSection className="foo"></AccordionSection> );
		expect( wrapper ).to.have.className( 'accordion__section' )
			.and.have.className( 'accordion__section' );
	} );
} );
