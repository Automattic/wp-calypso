/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity, merge } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import { DomainDetailsForm, DomainDetailsFormContainer } from '../domain-details-form';
import { domainRegistration, domainPrivacyProtection } from 'lib/cart-values/cart-items';
import { useSandbox } from 'test/helpers/use-sinon';

jest.mock( 'lib/analytics', () => {} );
jest.mock( 'i18n-calypso', () => ( {
	localize: x => x,
} ) );
jest.mock( 'lib/wp', () => {
	const wpcomMock = {
		undocumented: () => wpcomMock,
		me: () => wpcomMock,
		get: () => wpcomMock,
		getProducts: () => wpcomMock,
		getDomainContactInformation: () => wpcomMock,
		bind: () => wpcomMock,
	};

	return wpcomMock;
} );

describe( 'Domain Details Form', () => {
	const defaultProps = {
		productsList: {},
		cart: {
			products: [],
		},
		contactDetails: {},
		translate: identity,
	};

	const propsWithCountry = {
		...defaultProps,
		contactDetails: {
			countryCode: 'AU',
		},
	};

	const domainProduct = domainRegistration( {
		productSlug: 'normal_domain',
		domain: 'test.test',
	} );

	const domainProductWithExplicitPrivacy = domainRegistration( {
		productSlug: 'normal_domain',
		domain: 'test.test',
		extra: {
			private_registration_product_purchase_allowed: true,
		},
	} );

	const domainProductWithoutPrivacy = domainRegistration( {
		productSlug: 'unprivate_domain',
		extra: {
			private_registration_product_purchase_allowed: false,
		},
	} );

	test( 'does not blow up with default props', () => {
		const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );

		expect( wrapper ).to.have.length( 1 );
	} );

	test( 'should not render if domain details are missing', () => {
		const propsWithoutCOntactDetails = {
			...defaultProps,
			contactDetails: null,
		};
		const wrapper = shallow( <DomainDetailsFormContainer { ...propsWithoutCOntactDetails } /> );

		expect( wrapper.find( 'DomainDetailsForm' ) ).to.have.length( 0 );
		expect( wrapper.find( 'SecurePaymentFormPlaceholder' ) ).to.have.length( 1 );
	} );

	test( 'does not render privacy with no domains', () => {
		const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 0 );
	} );

	test( 'should render the privacy upsell with a domain with privacy support', () => {
		const propsWithDomain = merge( {}, defaultProps, {
			cart: { products: [ domainProductWithExplicitPrivacy ] },
		} );

		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomain } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 1 );
	} );

	test( 'should render privacy upsell for domain with support and privacy product', () => {
		const privacyProduct = domainPrivacyProtection( { domain: 'test.test' } );

		const propsWithDomainWithPrivacy = merge( {}, defaultProps, {
			cart: { products: [ domainProduct, privacyProduct ] },
		} );

		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomainWithPrivacy } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 1 );
	} );

	test( "should not render the privacy upsell with a domain that doesn't support privacy", () => {
		const propsWithDomainWithNoPrivacy = merge( {}, defaultProps, {
			cart: { products: [ domainProductWithoutPrivacy ] },
		} );
		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomainWithNoPrivacy } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 0 );
	} );

	test( 'should not render the privacy upsell with mixed privacy support', () => {
		const mixedSupportProps = merge( {}, defaultProps, {
			cart: { products: [ domainProductWithExplicitPrivacy, domainProductWithoutPrivacy ] },
		} );
		const wrapper = shallow( <DomainDetailsForm { ...mixedSupportProps } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 0 );
	} );

	test( 'should render privacy upsell without explicit privacy support', () => {
		const mixedSupportProps = merge( {}, defaultProps, { cart: { products: [ domainProduct ] } } );
		const wrapper = shallow( <DomainDetailsForm { ...mixedSupportProps } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 1 );
	} );

	describe( 'Google Apps Form UI state', () => {
		let needsOnlyGoogleAppsDetailsStub;

		useSandbox( sandbox => {
			needsOnlyGoogleAppsDetailsStub = sandbox.stub(
				DomainDetailsForm.prototype,
				'needsOnlyGoogleAppsDetails'
			);
		} );

		test( 'should not render GAppsFieldset component when the cart does not contain a Google App', () => {
			needsOnlyGoogleAppsDetailsStub.returns( false );
			const wrapper = shallow( <DomainDetailsForm { ...propsWithCountry } /> );

			expect( wrapper.find( 'GAppsFields' ) ).to.have.length( 0 );
			expect( wrapper.find( '.checkout__domain-contact-details-fields' ) ).to.have.length( 1 );
		} );

		test( 'should render GAppsFieldset component when the cart contains only a Google App', () => {
			needsOnlyGoogleAppsDetailsStub.returns( true );

			const wrapper = shallow( <DomainDetailsForm { ...propsWithCountry } /> );

			expect( wrapper.find( 'GAppsFieldset' ) ).to.have.length( 1 );
			expect( wrapper.find( '.checkout__domain-contact-details-fields' ) ).to.have.length( 0 );
		} );
	} );

	describe( 'Country selection', () => {
		test( 'should not render address fieldset when a country code is not available', () => {
			const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );

			expect( wrapper.find( 'RegionAddressFieldsets' ) ).to.have.length( 0 );
		} );

		test( 'should not render address fieldset when no country selected', () => {
			const wrapper = shallow(
				<DomainDetailsForm { ...defaultProps } contactDetails={ { countryCode: '' } } />
			);

			expect( wrapper.find( 'RegionAddressFieldsets' ) ).to.have.length( 0 );
		} );

		test( 'should render address fieldset when a valid countryCode is selected', () => {
			const wrapper = shallow( <DomainDetailsForm { ...propsWithCountry } /> );

			expect( wrapper.find( 'RegionAddressFieldsets' ) ).to.have.length( 1 );
		} );
	} );
} );
