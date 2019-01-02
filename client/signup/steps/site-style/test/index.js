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
import { SiteStyleStep } from '../';

jest.mock( 'lib/signup/actions', () => ( {
	submitSignupStep: jest.fn(),
	saveSignupStep: jest.fn(),
} ) );

describe( '<SiteStyleStep />', () => {
	const defaultProps = {
		goToNextStep: x => x,
		styleOptions: [
			{
				id: 'default',
				theme: 'pub/default',
				label: 'nice',
			},
			{
				id: 'eyesore',
				theme: 'pub/hipster',
				label: 'nicer',
			},
		],
		siteStyle: 'default',
		siteType: 'professional',
		setSiteStyle: jest.fn(),
		submitSiteStyle: jest.fn(),
		translate: x => x,
	};

	afterEach( () => {
		SignupActions.submitSignupStep.mockReset();
		SignupActions.saveSignupStep.mockReset();
	} );

	test( 'should render', () => {
		const wrapper = shallow( <SiteStyleStep { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( '`getSelectedStyleDataById()` should return the correct style data using the selected style by default', () => {
		const wrapper = shallow( <SiteStyleStep { ...defaultProps } /> );
		expect( wrapper.instance().getSelectedStyleDataById() ).toEqual(
			defaultProps.styleOptions[ 0 ]
		);
		expect( wrapper.instance().getSelectedStyleDataById( 'eyesore' ) ).toEqual(
			defaultProps.styleOptions[ 1 ]
		);
	} );

	test( 'should call `setSiteStyle()` from `handleStyleOptionChange()`', () => {
		const wrapper = shallow( <SiteStyleStep { ...defaultProps } /> );
		wrapper.instance().handleStyleOptionChange( {
			currentTarget: { value: 'default' },
		} );
		expect( defaultProps.setSiteStyle ).toHaveBeenCalledWith( 'default' );
	} );

	test( 'should call `submitSiteStyle()` from `handleSubmit()`', () => {
		const wrapper = shallow( <SiteStyleStep { ...defaultProps } siteStyle="eyesore" /> );
		wrapper.instance().handleSubmit( {
			preventDefault: () => {},
		} );
		expect( defaultProps.submitSiteStyle ).toHaveBeenCalledWith(
			'eyesore',
			'pub/hipster',
			'nicer'
		);
	} );
} );
