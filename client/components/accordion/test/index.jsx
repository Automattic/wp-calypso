/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	chaiEnzyme = require( 'chai-enzyme' ),
	React = require( 'react' ),
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' );

var Enzyme = require( 'enzyme' ),
	shallow = Enzyme.shallow,
	mount = Enzyme.mount;

chai.use( chaiEnzyme() );
chai.use( sinonChai );

require( 'react-tap-event-plugin' )();

/**
 * Internal dependencies
 */
var Accordion = require( '../' );

describe( 'Accordion', function() {
	it( 'should render as expected with a title and content', function() {
		const wrapper = mount( <Accordion title="Section">Content</Accordion> );
		expect( wrapper ).to.have.className( 'accordion' );
		expect( wrapper ).to.not.have.state( 'isExpanded' );
		expect( wrapper.find( '.accordion__header' ) ).to.exist
			.and.not.have.className( 'has-icon' )
			.and.not.have.className( 'has-subtitle' );
		expect( wrapper.find( '.accordion__icon' ) ).to.not.exist;
		expect( wrapper.find( '.accordion__title' ) ).to.have.text( 'Section' );
		expect( wrapper.find( '.accordion__subtitle' ) ).to.not.exist;
		expect( wrapper.ref( 'content' ) ).to.exist.and.have.text( 'Content' );
	} );

	it( 'should accept an icon prop to be rendered as a noticon', function() {
		const wrapper = shallow( <Accordion title="Section" icon="time">Content</Accordion> );
		expect( wrapper.find( '.accordion__header' ) ).to.exist
			.and.have.className( 'has-icon' )
			.and.not.have.className( 'has-subtitle' );
		expect( wrapper.find( '.accordion__icon' ) ).to.exist;
	} );

	it( 'should accept a subtitle prop to be rendered aside the title', function() {
		const wrapper = shallow( <Accordion title="Section" subtitle="Subtitle">Content</Accordion> );
		expect( wrapper.find( '.accordion__header' ) ).to.exist
			.and.have.className( 'has-subtitle' )
			.and.not.have.className( 'has-icon' );
		expect( wrapper.find( '.accordion__subtitle' ) ).to.have.text( 'Subtitle' );
	} );

	it( 'should toggle when clicked', function() {
		const wrapper = shallow( <Accordion title="Section">Content</Accordion> );
		wrapper.find( '.accordion__toggle' ).simulate( 'touchTap' );
		expect( wrapper ).to.have.state( 'isExpanded' );
	} );

	it( 'should accept onToggle function handler to be invoked when toggled', function( ) {
		const onToggleCallback = sinon.spy();
		const wrapper = shallow( <Accordion title="Section" onToggle={ onToggleCallback }>Content</Accordion> );
		wrapper.find( '.accordion__toggle' ).simulate( 'touchTap' );
		expect( onToggleCallback ).to.be.calledWith( true );
	} );

	it( 'should always use the initialExpanded prop, if specified', function() {
		const onToggleCallback = sinon.spy();
		const wrapper = shallow( <Accordion initialExpanded={ true } title="Section" onToggle={ onToggleCallback }>Content</Accordion> );
		wrapper.find( '.accordion__toggle' ).simulate( 'touchTap' );
		expect( onToggleCallback ).to.be.calledWith( false );
	} );
} );
