/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { SubmitStepButton } from '..';

describe( 'SubmitStepButton', () => {
	test( 'should render buttonText prop within a child button', () => {
		const wrapper = shallow( <SubmitStepButton buttonText="SubmitStepButton: buttonText" /> );
		const button = wrapper.find( Button );
		expect( button.length ).toBe( 1 );
		expect( button.children().text() ).toBe( 'SubmitStepButton: buttonText' );
	} );

	test( 'should trigger both submitSignupStep action and goToNextStep prop when clicked.', () => {
		const submitSignupStep = jest.fn();
		const goToNextStep = jest.fn();

		const wrapper = shallow(
			<SubmitStepButton
				buttonText="buttonText"
				stepName="test:step:1"
				submitSignupStep={ submitSignupStep }
				goToNextStep={ goToNextStep }
			/>
		);

		expect( submitSignupStep ).not.toHaveBeenCalled();
		expect( goToNextStep ).not.toHaveBeenCalled();

		// after simulate click event
		wrapper.find( Button ).simulate( 'click' );

		// the functions should be called
		expect( submitSignupStep ).toHaveBeenCalledWith( { stepName: 'test:step:1' } );
		expect( goToNextStep ).toHaveBeenCalled();
	} );
} );
