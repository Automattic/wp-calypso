/**
 * @jest-environment jsdom
 */

/* eslint-disable wpcalypso/jsx-classname-namespace,import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { matchers } from 'jest-emotion';
import { ThemeProvider } from 'emotion-theming';

/**
 * Internal dependencies
 */
import FormFieldAnnotation from '../components/form-field-annotation';

// Add the custom matchers provided by 'jest-emotion'
expect.extend( matchers );

const theme = {
	colors: {
		textColor: 'blue',
		textColorLight: 'lightblue',
		borderColor: 'black',
		error: 'red',
	},
	weights: { bold: '15pt' },
};

describe( 'FormFieldAnnotation', () => {
	describe( 'with no error and not disabled', () => {
		let MyFormFieldAnnotation = null;

		beforeEach( () => {
			MyFormFieldAnnotation = () => (
				<ThemeProvider theme={ theme }>
					<FormFieldAnnotation
						formFieldId="fieldId"
						labelText="A Label"
						labelId="labelId"
						normalDescription="A description"
						descriptionId="descriptionId"
						errorDescription="An Error Message"
						isError={ false }
						isDisabled={ false }
						className="test__annotation_class"
					>
						<span id="fieldId">{ 'child contents' }</span>
					</FormFieldAnnotation>
				</ThemeProvider>
			);
		} );

		it( 'renders the description string', () => {
			const { getAllByText } = render( <MyFormFieldAnnotation /> );
			expect( getAllByText( 'A description' )[ 0 ] ).toBeInTheDocument();
		} );

		it( 'does not render the error string', () => {
			const { queryAllByText } = render( <MyFormFieldAnnotation /> );
			expect( queryAllByText( 'An Error Message' )[ 0 ] ).toBeUndefined();
		} );
	} );

	describe( 'with error and not disabled', () => {
		let MyFormFieldAnnotation = null;

		beforeEach( () => {
			MyFormFieldAnnotation = () => (
				<ThemeProvider theme={ theme }>
					<FormFieldAnnotation
						formFieldId="fieldId"
						labelText="A Label"
						labelId="labelId"
						normalDescription="A description"
						descriptionId="descriptionId"
						errorDescription="An Error Message"
						isError="true"
						isDisabled="false"
						className="test__annotation_class"
					>
						<span id="fieldId">{ 'child contents' }</span>
					</FormFieldAnnotation>
				</ThemeProvider>
			);
		} );

		it( 'does not render the description string', () => {
			const { queryAllByText } = render( <MyFormFieldAnnotation /> );
			expect( queryAllByText( 'A description' )[ 0 ] ).toBeUndefined();
		} );

		it( 'renders the error string', () => {
			const { getAllByText } = render( <MyFormFieldAnnotation /> );
			expect( getAllByText( 'An Error Message' )[ 0 ] ).toBeInTheDocument();
		} );
	} );
} );
