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
import { SiteStyleStep } from '../';

describe( '<SiteStyleStep />', () => {
	const defaultProps = {
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
		goToNextStep: () => {},
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

	test( 'should select and submit the first item from the options array if no site style yet saved in state', () => {
		const wrapper = shallow( <SiteStyleStep { ...defaultProps } siteStyle={ null } /> );
		const siteStyleContent = shallow( wrapper.instance().renderContent() );
		const firstInputField = siteStyleContent.find( 'FormRadio' ).get( 0 );
		// check that the default is the first item rendered
		expect( firstInputField.props.value ).toEqual( defaultProps.styleOptions[ 0 ].id );
		// check that it's been selected
		expect( firstInputField.props.checked ).toBe( true );

		wrapper.instance().handleSubmit( {
			preventDefault: () => {},
		} );
		// check that we pass the default site option onSubmit
		expect( defaultProps.submitSiteStyle ).toHaveBeenCalledWith(
			defaultProps.styleOptions[ 0 ].id,
			defaultProps.styleOptions[ 0 ].theme,
			defaultProps.styleOptions[ 0 ].label
		);
	} );
} );
