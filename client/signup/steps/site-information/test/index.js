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
		siteType: 'business',
		submitStep: jest.fn(),
		updateStep: jest.fn(),
		informationType: 'title',
		translate: x => x,
		siteInformation: { title: 'Ho ho ho!' },
		headerText: 'headerTextoidaliciously',
		formFields: [ 'title', 'address', 'phone' ],
		stepName: 'site-information',
	};

	afterEach( () => {
		SignupActions.submitSignupStep.mockReset();
		SignupActions.saveSignupStep.mockReset();
	} );

	test( 'should render', () => {
		const wrapper = shallow( <SiteInformation { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should update field attributes based on the informationFields array values', () => {
		const wrapper = shallow(
			<SiteInformation { ...defaultProps } formFields={ [ 'phone', 'address' ] } />
		);
		const siteInformationContent = shallow( wrapper.instance().renderContent() );
		const inputFields = siteInformationContent.find( 'FormTextInput' );
		expect( inputFields ).toHaveLength( 2 );
		expect( inputFields.get( 0 ).props.name ).toEqual( 'phone' );
		expect( inputFields.get( 1 ).props.name ).toEqual( 'address' );
	} );

	test( 'should call `submitStep()` from `handleSubmit()`', () => {
		const wrapper = shallow( <SiteInformation { ...defaultProps } /> );
		wrapper.instance().handleSubmit( {
			preventDefault: () => {},
		} );
		expect( defaultProps.submitStep ).toHaveBeenCalledWith( defaultProps.siteInformation );
	} );

	test( 'should call `updateStep()` from `handleInputChange()`', () => {
		const wrapper = shallow( <SiteInformation { ...defaultProps } /> );
		wrapper.instance().handleInputChange( {
			currentTarget: { name: 'title', value: 'Tada!!!' },
		} );
		expect( defaultProps.updateStep ).toHaveBeenCalledWith( 'title', 'Tada!!!' );
	} );
} );
