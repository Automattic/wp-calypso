/**
 * External dependencies
 */
import React from 'react';
import useFakeDom from 'test/helpers/use-fake-dom';
import { shallow } from 'enzyme';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ProgressBar from '../';

describe( 'ProgressBar', function() {
	useFakeDom();

	it( 'should show the title', function() {
		const progressBar = shallow( <ProgressBar value={ 20 } title="foo" /> );

		expect( progressBar.find( '.progress-bar__progress' ).contains( 'foo' ) );
	} );

	it( 'should add is-pulsing class when isPulsing property is true', function() {
		const progressBar = shallow( <ProgressBar value={ 20 } isPulsing={ true } /> );

		expect( progressBar.hasClass( 'is-pulsing' ) );
	} );

	it( 'should not add is-pulsing class when isPulsing property is false', function() {
		const progressBar = shallow( <ProgressBar value={ 20 } isPulsing={ false } /> );

		expect( ! progressBar.hasClass( 'is-pulsing' ) );
	} );

	it( 'should add is-compact class when compact property is true', function() {
		const progressBar = shallow( <ProgressBar value={ 20 } compact={ true } /> );

		expect( progressBar.hasClass( 'is-compact' ) );
	} );

	it( 'should not add is-compact class when compact property is false', function() {
		const progressBar = shallow( <ProgressBar value={ 20 } compact={ false } /> );

		expect( ! progressBar.hasClass( 'is-compact' ) );
	} );

	it( 'should properly calculate the width percentage', function() {
		const progressBar = shallow( <ProgressBar value={ 20 } total={ 40 } /> );

		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).to.be.equal( '50%' );
	} );

	it( 'should have the color provided by the color property', function() {
		const progressBar = shallow( <ProgressBar value={ 20 } color="red" /> );

		expect( progressBar.find( '.progress-bar__progress' ).props().style.backgroundColor ).to.be.equal( 'red' );
	} );

	it( 'should not be able to be more than 100% complete', () => {
		const progressBar = shallow( <ProgressBar value={ 240 }/> );
		expect( progressBar.find( '.progress-bar__progress' ).props().style.width ).to.be.equal( '100%' );
	} );
} );
