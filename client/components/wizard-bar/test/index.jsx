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
import WizardBar from '../';

describe( 'WizardBar', function() {
	useFakeDom();

	it( 'should properly calculate the width percentage', function() {
		const wizardBar = shallow( <WizardBar value={ 20 } total={ 40 } /> );

		expect( wizardBar.find( '.wizard-bar__progress' ).props().style.width ).to.be.equal( '50%' );
	} );

	it( 'should have the color provided by the color property', function() {
		const wizardBar = shallow( <WizardBar value={ 20 } color="red" /> );

		expect( wizardBar.find( '.wizard-bar__progress' ).props().style.backgroundColor ).to.be.equal( 'red' );
	} );

	it( 'should not be able to be more than 100% complete', () => {
		const wizardBar = shallow( <WizardBar value={ 240 } /> );
		expect( wizardBar.find( '.wizard-bar__progress' ).props().style.width ).to.be.equal( '100%' );
	} );
} );
