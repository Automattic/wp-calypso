/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';
import { SiteInformation } from '../';

jest.mock( 'lib/signup/actions', () => ( {
	submitSignupStep: jest.fn(),
	saveSignupStep: jest.fn(),
} ) );

describe( '<SiteInformation />', () => {
	const defaultProps = {
		siteInformationValue: 'Ho ho ho!',
		siteType: 'business',
		submitStep: jest.fn(),
		updateStep: jest.fn(),
		informationType: 'title',
		translate: x => x,
		headerText: 'a',
		fieldLabel: 'b',
		fieldDescription: 'c',
		fieldPlaceholder: 'd',
	};

	afterEach( () => {
		SignupActions.submitSignupStep.mockReset();
		SignupActions.saveSignupStep.mockReset();
	} );

	test( 'should render', () => {
		const wrapper = shallow( <SiteInformation { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should update field attributes based on the informationType', () => {
		const wrapper = shallow( <SiteInformation { ...defaultProps } informationType="email" /> );
		const siteInformationContent = shallow( wrapper.instance().renderContent() );
		const formInput = siteInformationContent.find( 'FormTextInput' );
		expect( formInput.props().id ).toEqual( 'email' );
		expect( formInput.props().name ).toEqual( 'email' );
	} );

	test( 'should call `submitStep()` from `handleSubmit()`', () => {
		const wrapper = shallow( <SiteInformation { ...defaultProps } /> );
		wrapper.instance().handleSubmit( {
			preventDefault: () => {},
		} );
		expect( defaultProps.submitStep ).toHaveBeenCalledWith( defaultProps.siteInformationValue );
	} );

	test( 'should call `updateStep()` from `handleInputChange()`', () => {
		const wrapper = shallow( <SiteInformation { ...defaultProps } /> );
		wrapper.instance().handleInputChange( {
			currentTarget: { value: 'Tada!!!' },
		} );
		expect( defaultProps.updateStep ).toHaveBeenCalledWith( 'Tada!!!' );
	} );
} );
