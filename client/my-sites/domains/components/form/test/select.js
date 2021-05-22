/**
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
import Select from '../select';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'calypso/lib/user', () => () => {} );

describe( '<Select />', () => {
	const defaultProps = {
		label: 'Select label',
		name: 'select',
		onChange: jest.fn(),
		options: [
			{ label: 'uno', value: 1 },
			{ label: 'due', value: 2 },
		],
		value: '',
		additionalClasses: 'mega-selectzilla',
		errorMessage: null,
	};

	test( 'should render expected output', () => {
		const wrapper = shallow( <Select { ...defaultProps } /> );
		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should render form validation when there is an error', () => {
		const newProps = {
			...defaultProps,
			errorMessage: 'Duh duh duh!',
		};
		const wrapper = shallow( <Select { ...newProps } /> );
		expect( wrapper.find( 'FormInputValidation' ) ).toHaveLength( 1 );
	} );
} );
