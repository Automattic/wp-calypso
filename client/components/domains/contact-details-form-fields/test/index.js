/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { ContactDetailsFormFields } from '../';

jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
	translate: x => x,
} ) );

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
		onSubmit: noop,
	};

	describe( 'default fields', () => {
		test( 'should render', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } /> );
			expect( wrapper ).toMatchSnapshot();
		} );

		test( 'should render fields when contact details contains no values', () => {
			const wrapper = shallow(
				<ContactDetailsFormFields contactDetails={ {} } onSubmit={ noop } />
			);
			expect( wrapper.find( '.contact-details-form-fields__container.first-name' ) ).toHaveLength(
				1
			);
			expect( wrapper.find( '.contact-details-form-fields__container.last-name' ) ).toHaveLength(
				1
			);
			expect( wrapper.find( '.contact-details-form-fields__container.phone' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'Google Apps Form UI state', () => {
		test( 'should not render GAppsFieldset in place of the default contact fields by default', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } /> );

			expect( wrapper.find( 'GAppsFields' ) ).toHaveLength( 0 );
			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 1 );
		} );

		test( 'should render GAppsFieldset in place of default contact fields', () => {
			const wrapper = shallow(
				<ContactDetailsFormFields { ...defaultProps } needsOnlyGoogleAppsDetails={ true } />
			);

			expect( wrapper.find( 'GAppsFieldset' ) ).toHaveLength( 1 );
			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'Country selection', () => {
		test( 'should not render address fieldset when a country code is not available', () => {
			const wrapper = shallow( <ContactDetailsFormFields onSubmit={ defaultProps.onSubmit } /> );

			expect( wrapper.find( 'RegionAddressFieldsets' ) ).toHaveLength( 0 );
		} );

		test( 'should not render address fieldset when no country selected', () => {
			const wrapper = shallow(
				<ContactDetailsFormFields
					contactDetails={ { countryCode: '' } }
					onSubmit={ defaultProps.onSubmit }
				/>
			);

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

			expect( wrapper.find( '.contact-details-form-fields__container.fax' ) ).toHaveLength( 0 );
		} );

		test( 'should render fax field when fax required', () => {
			const wrapper = shallow( <ContactDetailsFormFields { ...defaultProps } needsFax={ true } /> );
			expect( wrapper.find( '.contact-details-form-fields__container.fax' ) ).toHaveLength( 1 );
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
				wrapper
					.find( '.contact-details-form-fields__submit-button' )
					.render()
					.text()
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
		test( 'should user address country if available', () => {
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
				contactDetails: {
					...defaultProps.contactDetails,
					countryCode: '',
				},
				onSubmit: noop,
				userCountryCode: 'FR',
			};
			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );
			expect( wrapper.find( 'FormPhoneMediaInput' ).props().countryCode ).toEqual( 'FR' );
		} );

		test( 'should use US as fallback', () => {
			const newProps = {
				contactDetails: {
					...defaultProps.contactDetails,
					countryCode: '',
				},
				onSubmit: noop,
			};
			const wrapper = shallow( <ContactDetailsFormFields { ...newProps } /> );
			expect( wrapper.find( 'FormPhoneMediaInput' ).props().countryCode ).toEqual( 'US' );
		} );
	} );
} );
