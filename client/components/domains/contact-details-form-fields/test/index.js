/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import update from 'immutability-helper';
import { omit } from 'lodash';
import FormPhoneMediaInput from 'calypso/components/forms/form-phone-media-input';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ContactDetailsFormFields } from '../';

const render = ( el, options ) => renderWithProvider( el, { ...options } );

const noop = () => {};

jest.mock( '../custom-form-fieldsets/region-address-fieldsets', () => () => (
	<div data-testid="region-address-fieldsets" />
) );

jest.mock( 'calypso/components/forms/form-phone-media-input', () =>
	jest.fn( () => <div data-testid="form-phone-media-input" /> )
);

describe( 'ContactDetailsFormFields', () => {
	afterEach( () => {
		FormPhoneMediaInput.mockClear();
	} );

	const defaultProps = {
		contactDetails: {
			firstName: 'Osso',
			lastName: 'Buco',
			organization: 'Il pagliaccio del comune',
			email: 'osso@buco.com',
			phone: '+3398067382',
			address1: 'Via Strada Bella',
			address2: '',
			city: 'Piccolo Villagio',
			state: 'AG',
			postalCode: '12345',
			countryCode: 'IT',
			fax: '+3398067382',
		},
		countriesList: [
			{
				code: 'AU',
				name: 'Australia',
			},
			{
				code: 'BR',
				name: 'Brazil',
			},
			{
				code: 'IT',
				name: 'Italy',
			},
		],
		onSubmit: noop,
		translate: ( string ) => string,
	};

	describe( 'default fields', () => {
		test( 'should render', () => {
			const { container } = render( <ContactDetailsFormFields { ...defaultProps } /> );
			expect( container.firstChild ).toMatchSnapshot();
		} );

		test( 'should render fields when contact details contains no values', () => {
			const newProps = { ...defaultProps, contactDetails: {} };

			render( <ContactDetailsFormFields { ...newProps } /> );

			expect( screen.queryByRole( 'textbox', { name: /first name/i } ) ).toBeVisible();
			expect( screen.queryByRole( 'textbox', { name: /last name/i } ) ).toBeVisible();
			expect( screen.queryByTestId( 'form-phone-media-input' ) ).toBeVisible();
		} );
	} );

	describe( 'onSubmit prop is undefined', () => {
		test( 'should not render Submit button', () => {
			const newProps = { ...defaultProps, onSubmit: undefined };
			render( <ContactDetailsFormFields { ...newProps } /> );
			expect( screen.queryByRole( 'button', { name: /submit/i } ) ).not.toBeInTheDocument();
		} );

		test( 'should render a Submit button', () => {
			const newProps = { ...defaultProps };
			render( <ContactDetailsFormFields { ...newProps } /> );
			expect( screen.queryByRole( 'button', { name: /submit/i } ) ).toBeVisible();
		} );
	} );

	describe( 'Google Apps Form UI state', () => {
		test( 'should not render GAppsFieldset in place of the default contact fields by default', () => {
			const { container } = render( <ContactDetailsFormFields { ...defaultProps } /> );

			const [ gapps ] = container.getElementsByClassName( 'g-apps-fieldset' );

			expect( gapps ).toBeUndefined();
			expect( screen.queryByTestId( 'region-address-fieldsets' ) ).toBeVisible();
		} );

		test( 'should render GAppsFieldset in place of default contact fields when required', () => {
			const { container } = render(
				<ContactDetailsFormFields { ...defaultProps } needsOnlyGoogleAppsDetails />
			);

			const [ gapps ] = container.getElementsByClassName( 'g-apps-fieldset' );

			expect( gapps ).toBeVisible();
			expect( screen.queryByTestId( 'region-address-fieldsets' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Country selection', () => {
		test( 'should not render address fieldset when no country code is available', () => {
			const newProps = omit( defaultProps, 'contactDetails.countryCode' );
			render( <ContactDetailsFormFields { ...newProps } /> );

			expect( screen.queryByTestId( 'region-address-fieldsets' ) ).not.toBeInTheDocument();
		} );

		test( 'should not render address fieldset when no country selected', () => {
			const newProps = update( defaultProps, { contactDetails: { countryCode: { $set: '' } } } );
			render( <ContactDetailsFormFields { ...newProps } /> );

			expect( screen.queryByTestId( 'region-address-fieldsets' ) ).not.toBeInTheDocument();
		} );

		test( 'should render address fieldset when a valid countryCode is selected', () => {
			render( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( screen.queryByTestId( 'region-address-fieldsets' ) ).toBeVisible();
		} );
	} );

	describe( 'Fax field', () => {
		test( 'should not render fax field by default', () => {
			render( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( screen.queryByRole( 'textbox', { name: /fax/i } ) ).not.toBeInTheDocument();
		} );

		test( 'should render fax field when fax required', () => {
			render( <ContactDetailsFormFields { ...defaultProps } needsFax /> );

			expect( screen.queryByRole( 'textbox', { name: /fax/i } ) ).toBeVisible();
		} );
	} );

	describe( 'label text', () => {
		test( 'should render submit button text', () => {
			const buttonLabel = 'Click it yo!';
			render(
				<ContactDetailsFormFields
					{ ...defaultProps }
					labelTexts={ { submitButton: buttonLabel } }
				/>
			);

			expect( screen.queryByRole( 'button', { name: buttonLabel } ) ).toBeVisible();
		} );

		test( 'should render organization text', () => {
			const { organization, ...contactDetails } = defaultProps.contactDetails;
			render(
				<ContactDetailsFormFields
					{ ...defaultProps }
					contactDetails={ contactDetails }
					labelTexts={ { organization: 'Nice Guys Inc' } }
				/>
			);

			expect( screen.getByText( 'Nice Guys Inc' ) ).toBeVisible();
		} );
	} );

	describe( 'onCancel', () => {
		test( 'should not render cancel button by default', () => {
			render( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( screen.queryByRole( 'button', { name: /cancel/i } ) ).not.toBeInTheDocument();
		} );

		test( 'should render cancel button when `onCancel` method prop passed', () => {
			render( <ContactDetailsFormFields { ...defaultProps } onCancel={ noop } /> );

			expect( screen.queryByRole( 'button', { name: /cancel/i } ) ).toBeVisible();
		} );
	} );

	describe( 'Addresses with no province/state', () => {
		test( 'should return province/state value when the country has states', async () => {
			const onContactDetailsChange = jest.fn();

			const { rerender } = render(
				<ContactDetailsFormFields
					{ ...defaultProps }
					onContactDetailsChange={ onContactDetailsChange }
				/>
			);

			rerender(
				<ContactDetailsFormFields
					{ ...defaultProps }
					onContactDetailsChange={ onContactDetailsChange }
					hasCountryStates
				/>
			);

			expect( onContactDetailsChange ).toHaveBeenCalledWith(
				expect.objectContaining( { state: defaultProps.contactDetails.state } )
			);
		} );

		test( 'should return province/state value when the country does not have states', () => {
			const onContactDetailsChange = jest.fn();

			const { rerender } = render(
				<ContactDetailsFormFields
					{ ...defaultProps }
					onContactDetailsChange={ onContactDetailsChange }
				/>
			);

			rerender(
				<ContactDetailsFormFields
					{ ...defaultProps }
					onContactDetailsChange={ onContactDetailsChange }
					hasCountryStates={ false }
				/>
			);

			expect( onContactDetailsChange ).toHaveBeenCalledWith(
				expect.objectContaining( { state: defaultProps.contactDetails.state } )
			);
		} );
	} );

	describe( 'Setting phone input country', () => {
		test( 'should use address country if available', () => {
			const newProps = {
				...defaultProps,
				countryCode: 'JP',
				userCountryCode: 'NZ',
			};

			render( <ContactDetailsFormFields { ...newProps } /> );

			expect( FormPhoneMediaInput ).toHaveBeenCalledWith(
				expect.objectContaining( {
					value: { countryCode: 'JP', phoneNumber: defaultProps.contactDetails.phone },
				} ),
				expect.anything()
			);
		} );

		test( 'should set phone country using geo location when country code not available in contact details', () => {
			const newProps = {
				...update( defaultProps, { contactDetails: { countryCode: { $set: '' } } } ),
				userCountryCode: 'FR',
			};

			render( <ContactDetailsFormFields { ...newProps } /> );

			expect( FormPhoneMediaInput ).toHaveBeenCalledWith(
				expect.objectContaining( {
					value: { countryCode: 'FR', phoneNumber: defaultProps.contactDetails.phone },
				} ),
				expect.anything()
			);
		} );

		test( 'should use US as fallback', () => {
			const newProps = update( defaultProps, { contactDetails: { countryCode: { $set: '' } } } );

			render( <ContactDetailsFormFields { ...newProps } /> );

			expect( FormPhoneMediaInput ).toHaveBeenCalledWith(
				expect.objectContaining( {
					value: { countryCode: 'US', phoneNumber: defaultProps.contactDetails.phone },
				} ),
				expect.anything()
			);
		} );
	} );
} );
