/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import ProgressBar from '../';

describe( 'ProgressBar', () => {
	test( 'should show the title', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } title="foo" /> );

		expect( progressBar.find( '.progress-bar__progress' ).contains( 'foo' ) ).toBe( true );
	} );

	test( 'should add is-pulsing class when isPulsing property is true', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } isPulsing={ true } /> );

		expect( progressBar.hasClass( 'is-pulsing' ) ).toBe( true );
	} );

	test( 'should not add is-pulsing class when isPulsing property is false', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } isPulsing={ false } /> );

		expect( progressBar.hasClass( 'is-pulsing' ) ).toBe( false );
	} );

	test( 'should add is-compact class when compact property is true', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } compact={ true } /> );

		expect( progressBar.hasClass( 'is-compact' ) ).toBe( true );
	} );

	test( 'should not add is-compact class when compact property is false', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } compact={ false } /> );

		expect( ! progressBar.hasClass( 'is-compact' ) ).toBe( true );
	} );

	test( 'should properly calculate the width percentage', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } total={ 40 } /> );

		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).toBe( '50%' );
	} );

	test( 'should have correct aria values', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } total={ 40 } /> );
		const props = progressBar.find( '.progress-bar__progress' ).props();

		expect( props[ 'aria-valuenow' ] ).toBe( 20 );
		expect( props[ 'aria-valuemax' ] ).toBe( 40 );
	} );

	test( 'should have the color provided by the color property', () => {
		const progressBar = shallow( <ProgressBar value={ 20 } color="red" /> );

		expect( progressBar.find( '.progress-bar__progress' ).props().style.backgroundColor ).toBe(
			'red'
		);
	} );

	test( 'should not be able to be more than 100% complete', () => {
		const progressBar = shallow( <ProgressBar value={ 240 } /> );
		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).toBe( '100%' );
	} );

	test( 'should never jump back', () => {
		const progressBar = shallow( <ProgressBar value={ 10 } /> );
		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).toBe( '10%' );
		progressBar.setProps( { value: 20 } );
		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).toBe( '20%' );
		progressBar.setProps( { value: 15 } );
		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).toBe( '20%' );
		progressBar.setProps( { value: 30 } );
		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).toBe( '30%' );

		// Other props should update the component
		progressBar.setProps( { isPulsing: true } );
		expect( progressBar.hasClass( 'is-pulsing' ) ).toBe( true );
	} );
} );
