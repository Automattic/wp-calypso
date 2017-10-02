/**
 * External Dependencies
 */
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal Dependencies
 */
import ScrollTrack from '../ScrollTrack';
import { BASE_CLASS } from '../helpers/constants';

const hoverClass = `${ BASE_CLASS }-is-hovered`;
const puckClass = `${ BASE_CLASS }__puck`;
const trackClass = `${ BASE_CLASS }__track`;

describe( '<ScrollTrack />', () => {
	it( 'should render with the proper track classes based on direction', () => {
		const horizontalWrapper = shallow( <ScrollTrack direction="horizontal" puckOffset={ 0 } puckSize={ 0 } /> );
		expect( horizontalWrapper ).to.have.className( `${ trackClass } ${ trackClass }-horizontal` );
		const verticalWrapper = shallow( <ScrollTrack direction="vertical" puckOffset={ 10 } puckSize={ 10 } /> );
		expect( verticalWrapper ).to.have.className( `${ trackClass } ${ trackClass }-vertical` );
	} );

	it( 'should render a puck with the proper puck classes based on direction', () => {
		const horizontalWrapper = shallow( <ScrollTrack direction="horizontal" puckOffset={ 10 } puckSize={ 10 } /> );
		expect( horizontalWrapper.find( `.${ puckClass }.${ puckClass }-horizontal` ) ).to.have.length( 1 );
		const verticalWrapper = shallow( <ScrollTrack direction="vertical" puckOffset={ 10 } puckSize={ 10 } /> );
		expect( verticalWrapper.find( `.${ puckClass }.${ puckClass }-vertical` ) ).to.have.length( 1 );
	} );

	it( 'should add the hover class to the track when trackHovered is set', () => {
		const horizontalWrapper = shallow( <ScrollTrack direction="horizontal" trackHovered puckOffset={ 10 } puckSize={ 10 } /> );
		expect( horizontalWrapper ).to.have.className( `${ trackClass } ${ trackClass }-horizontal ${ hoverClass }` );
		const verticalWrapper = shallow( <ScrollTrack direction="vertical" trackHovered puckOffset={ 10 } puckSize={ 10 } /> );
		expect( verticalWrapper ).to.have.className( `${ trackClass } ${ trackClass }-vertical ${ hoverClass }` );
	} );

	it( 'should add the hover class to the puck when puckHovered is set', () => {
		const horizontalWrapper = shallow( <ScrollTrack direction="horizontal" puckHovered puckOffset={ 10 } puckSize={ 10 } /> );
		expect( horizontalWrapper.find( `.${ puckClass }.${ puckClass }-horizontal.${ hoverClass }` ) ).to.have.length( 1 );
		const verticalWrapper = shallow( <ScrollTrack direction="vertical" puckHovered puckOffset={ 10 } puckSize={ 10 } /> );
		expect( verticalWrapper.find( `.${ puckClass }.${ puckClass }-vertical.${ hoverClass }` ) ).to.have.length( 1 );
	} );

	it( 'should set the height or width as appropriate when the puckSize is set', () => {
		const horizontalWrapper = shallow( <ScrollTrack direction="horizontal" puckOffset={ 10 } puckSize={ 10 } /> );
		const horizontalPuck = horizontalWrapper.find( `.${ puckClass }` ).at( 0 );
		expect( horizontalPuck.prop( 'style' ).width ).to.be.equal( '10px' );
		const verticalWrapper = shallow( <ScrollTrack direction="vertical" puckOffset={ 10 } puckSize={ 10 } /> );
		const verticalPuck = verticalWrapper.find( `.${ puckClass }` ).at( 0 );
		expect( verticalPuck.prop( 'style' ).height ).to.be.equal( '10px' );
	} );

	it( 'should set the proper styles to move the puck on the screen when the puckOffset is set', () => {
		const horizontalWrapper = shallow( <ScrollTrack direction="horizontal" puckOffset={ 10 } puckSize={ 10 } /> );
		const horizontalPuck = horizontalWrapper.find( `.${ puckClass }` ).at( 0 );
		expect( horizontalPuck.prop( 'style' ).transform ).to.be.equal( 'translateX(10px)' );
		const verticalWrapper = shallow( <ScrollTrack direction="vertical" puckOffset={ 10 } puckSize={ 10 } /> );
		const verticalPuck = verticalWrapper.find( `.${ puckClass }` ).at( 0 );
		expect( verticalPuck.prop( 'style' ).transform ).to.be.equal( 'translateY(10px)' );
	} );
} );
