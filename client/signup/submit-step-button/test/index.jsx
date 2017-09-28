jest.mock( 'lib/signup/actions', () => ( {
	submitSignupStep: require( 'sinon' ).stub()
} ) );

/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { stub } from 'sinon';

/**
 * Internal dependencies
 */
import SubmitStepButton from '..';
import { submitSignupStep } from 'lib/signup/actions';

describe( 'SubmitStepButton', () => {
	it( 'should render buttonText prop within a child button', () => {
		const wrapper = shallow( <SubmitStepButton buttonText="SubmitStepButton: buttonText" /> );

		expect( wrapper.find( 'button' ) ).to.have.length( 1 );
		expect( wrapper.find( 'button' ).text() ).to.equal( 'SubmitStepButton: buttonText' );
	} );

	it( 'should trigger both submitSignupStep action creator and goToNextStep prop when clicked.', () => {
		const goToNextStep = stub();
		const wrapper = shallow( <SubmitStepButton buttonText="buttonText" stepName="test:step:1" goToNextStep={ goToNextStep } /> );

		expect( submitSignupStep ).not.to.have.been.called;
		expect( goToNextStep ).not.to.have.been.called;

		// after simulate click event
		wrapper.find( 'button' ).simulate( 'click' );

		// the functions should be called
		expect( submitSignupStep ).to.have.been.calledWith( { stepName: 'test:step:1' } );
		expect( goToNextStep ).to.have.been.called;
	} );
} );
