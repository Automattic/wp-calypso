/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import update from 'immutability-helper';
import { shallow } from 'enzyme';
import { noop, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { ContactDetailsFormFields } from '../';
import FormButton from '../../../../components/forms/form-button';

jest.mock( 'i18n-calypso', () => ( {
	localize: ( x ) => x,
	translate: ( x ) => x,
} ) );

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

describe( 'ContactDetailsFormFields', () => {
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
		],
		onSubmit: noop,
	};

	describe( 'default fields', () => {
		test( 'should render', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( wrapper ).toMatchSnapshot();
		} );

		test( 'should render fields when contact details contains no values', () => {
			const newProps = { ...defaultProps, contactDetails: {} };

			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );

			expect( wrapper.find( '[name="first-name"]' ) ).toHaveLength( 1 );
			expect( wrapper.find( '[name="last-name"]' ) ).toHaveLength( 1 );
			expect( wrapper.find( '[name="phone"]' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'onSubmit prop is undefined', () => {
		test( 'should not render Submit button', () => {
			const newProps = { ...defaultProps, onSubmit: undefined };
			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );
			expect( wrapper.find( FormButton ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'Google Apps Form UI state', () => {
		test( 'should not render GAppsFieldset in place of the default contact fields by default', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( wrapper.find( '.contact-details-form-fields__row.g-apps-fieldset' ) ).toHaveLength(
				0
			);
			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 1 );
		} );

		test( 'should render GAppsFieldset in place of default contact fields when required', () => {
			const wrapper = shallow(
				<ContactDetailsFormFields { ...defaultProps } needsOnlyGoogleAppsDetails={ true } />
			);

			expect( wrapper.find( '.contact-details-form-fields__row.g-apps-fieldset' ) ).toHaveLength(
				1
			);
			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'Country selection', () => {
		test( 'should not render address fieldset when no country code is available', () => {
			const newProps = omit( defaultProps, 'contactDetails.countryCode' );

			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );

			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 0 );
		} );

		test( 'should not render address fieldset when no country selected', () => {
			const newProps = update( defaultProps, { contactDetails: { countryCode: { $set: '' } } } );

			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );

			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 0 );
		} );

		test( 'should render address fieldset when a valid countryCode is selected', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'Fax field', () => {
		test( 'should not render fax field by default', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( wrapper.find( '[name="fax"]' ) ).toHaveLength( 0 );
		} );

		test( 'should render fax field when fax required', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } needsFax={ true } /> );

			expect( wrapper.find( '[name="fax"]' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'label text', () => {
		test( 'should render submit button text', () => {
			const wrapper = shallow(
				<ContactDetailsFormFields
					{ ...defaultProps }
					labelTexts={ { submitButton: 'Click it yo!' } }
				/>
			);

			expect(
				wrapper.find( '.contact-details-form-fields__submit-button' ).render().text()
			).toEqual( 'Click it yo!' );
		} );

		test( 'should render organization text', () => {
			const wrapper = shallow(
				<ContactDetailsFormFields
					{ ...defaultProps }
					labelTexts={ { organization: 'Nice Guys Inc' } }
				/>
			);

			expect( wrapper.find( 'HiddenInput' ).props().text ).toEqual( 'Nice Guys Inc' );
		} );
	} );

	describe( 'onCancel', () => {
		test( 'should not render cancel button by default', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( wrapper.find( '.contact-details-form-fields__cancel-button' ) ).toHaveLength( 0 );
		} );

		test( 'should render cancel button when `onCancel` method prop passed', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } onCancel={ noop } /> );

			expect( wrapper.find( '.contact-details-form-fields__cancel-button' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'Addresses with no province/state', () => {
		test( 'should return province/state value when the country has states', () => {
			const onContactDetailsChange = jest.fn();

			const wrapper = shallow(
				<ContactDetailsFormFields
					{ ...defaultProps }
					onContactDetailsChange={ onContactDetailsChange }
				/>
			);
			wrapper.setProps( { hasCountryStates: true } );

			expect( wrapper.instance().getMainFieldValues().state ).toEqual(
				defaultProps.contactDetails.state
			);
		} );
		test( 'should return province/state value when the country does not have states', () => {
			const onContactDetailsChange = jest.fn();

			const wrapper = shallow(
				<ContactDetailsFormFields
					{ ...defaultProps }
					onContactDetailsChange={ onContactDetailsChange }
				/>
			);
			wrapper.setProps( { hasCountryStates: false } );

			expect( wrapper.instance().getMainFieldValues().state ).toEqual(
				defaultProps.contactDetails.state
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

			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );

			expect( wrapper.find( 'FormPhoneMediaInput' ).props().countryCode ).toEqual( 'JP' );
		} );

		test( 'should set phone country using geo location when country code not available in contact details', () => {
			const newProps = {
				...update( defaultProps, { contactDetails: { countryCode: { $set: '' } } } ),
				userCountryCode: 'FR',
			};

			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );

			expect( wrapper.find( 'FormPhoneMediaInput' ).props().countryCode ).toEqual( 'FR' );
		} );

		test( 'should use US as fallback', () => {
			const newProps = update( defaultProps, { contactDetails: { countryCode: { $set: '' } } } );

			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );

			expect( wrapper.find( 'FormPhoneMediaInput' ).props().countryCode ).toEqual( 'US' );
		} );
	} );
} );
