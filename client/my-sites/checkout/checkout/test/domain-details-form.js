/** @jest-environment jsdom */
jest.mock( 'lib/analytics', () => {} );
jest.mock( 'i18n-calypso', () => ( {
	localize: x => x
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

/**
 * External Dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { identity, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	domainRegistration,
	domainPrivacyProtection
} from 'lib/cart-values/cart-items';
import {
	DomainDetailsForm,
	DomainDetailsFormContainer
} from '../domain-details-form';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'Domain Details Form', () => {
	const defaultProps = {
		productsList: {},
		cart: {
			products: [],
		},
		contactDetails: {
		},
		translate: identity,
		updateContactDetailsCache: identity
	};

	const domainProduct = domainRegistration( {
		productSlug: 'normal_domain',
		domain: 'test.test',
	} );

	const domainProductWithExplicitPrivacy = domainRegistration( {
		productSlug: 'normal_domain',
		domain: 'test.test',
		extra: {
			privacy_available: true
		},
	} );

	const domainProductWithoutPrivacy = domainRegistration( {
		productSlug: 'unprivate_domain',
		extra: {
			privacy_available: false
		},
	} );

	it( 'does not blow up with default props', () => {
		const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );

		expect( wrapper ).to.have.length( 1 );
	} );

	it( 'should not render if domain details are missing', function() {
		const propsWithoutCOntactDetails = {
			...defaultProps,
			contactDetails: null,
		};
		const wrapper = shallow( <DomainDetailsFormContainer { ...propsWithoutCOntactDetails } /> );

		expect( wrapper.find( 'DomainDetailsForm' ) ).to.have.length( 0 );
		expect( wrapper.find( 'SecurePaymentFormPlaceholder' ) ).to.have.length( 1 );
	} );

	it( 'does not render privacy with no domains', () => {
		const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 0 );
	} );

	it( 'should render the privacy upsell with a domain with privacy support', () => {
		const propsWithDomain = merge(
			{},
			defaultProps,
			{ cart: { products: [ domainProductWithExplicitPrivacy ] } }
		);

		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomain } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 1 );
	} );

	it( 'should render privacy upsell for domain with support and privacy product', () => {
		const privacyProduct = domainPrivacyProtection( { domain: 'test.test' } );

		const propsWithDomainWithPrivacy = merge(
			{},
			defaultProps,
			{ cart: { products: [ domainProduct, privacyProduct ] } }
		);

		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomainWithPrivacy } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 1 );
	} );

	it( "should not render the privacy upsell with a domain that doesn't support privacy", () => {
		const propsWithDomainWithNoPrivacy = merge(
			{},
			defaultProps,
			{ cart: { products: [ domainProductWithoutPrivacy ] } }
		);
		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomainWithNoPrivacy } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 0 );
	} );

	it( 'should not render the privacy upsell with mixed privacy support', () => {
		const mixedSupportProps = merge(
			{},
			defaultProps,
			{ cart: { products: [ domainProductWithExplicitPrivacy, domainProductWithoutPrivacy ] } }
		);
		const wrapper = shallow( <DomainDetailsForm { ...mixedSupportProps } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 0 );
	} );

	it( 'should render privacy upsell without explicit privacy support', () => {
		const mixedSupportProps = merge(
			{},
			defaultProps,
			{ cart: { products: [ domainProduct ] } }
		);
		const wrapper = shallow( <DomainDetailsForm { ...mixedSupportProps } /> );

		expect( wrapper.find( 'PrivacyProtection' ) ).to.have.length( 1 );
	} );

	describe( 'Country selection', () => {
		let needsOnlyGoogleAppsDetailsStub;

		useSandbox( ( sandbox ) => {
			needsOnlyGoogleAppsDetailsStub = sandbox.stub( DomainDetailsForm.prototype, 'needsOnlyGoogleAppsDetails' );
		} );

		it( 'should not render address fieldset when no country selected', () => {
			const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );
			wrapper.find( 'CountrySelect' ).simulate( 'change', { target: {
				value: '',
				name: 'countryCode'
			} } );
			expect( wrapper.find( '.checkout__domain-details-fieldset' ) ).to.have.length( 0 );
		} );

		it( 'should render address fieldset when a valid countryCode is selected', () => {
			const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );

			wrapper.find( 'CountrySelect' ).simulate( 'change', { target: {
				value: 'AU',
				name: 'countryCode'
			} } );

			expect( wrapper.find( '.checkout__domain-details-fieldset' ) ).to.have.length( 1 );
		} );

		it( 'should not render address fieldset when the country field is showing an error', () => {
			const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );
			const newCountyCodeState = {
				value: 'BR',
				name: 'countryCode'
			};

			wrapper.find( 'CountrySelect' ).simulate( 'change', { target: newCountyCodeState } );
			wrapper.setState( {
				form: Object.assign( {}, wrapper.state().form, {
					countryCode: {
						value: 'BR',
						name: 'countryCode',
						errors: [ 1, 2, 3 ]
					}
				} )
			} );

			wrapper.update();
			expect( wrapper.find( '.checkout__domain-details-fieldset' ) ).to.have.length( 0 );
		} );

		it( 'should render address, city, and postal code fields when the cart does not contain a Google App ', () => {
			needsOnlyGoogleAppsDetailsStub.returns( false );
			const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );
			wrapper.find( 'CountrySelect' ).simulate( 'change', { target: {
				value: 'AU',
				name: 'countryCode'
			} } );

			expect( wrapper.find( '.checkout__domain-details-fieldset Input' ) ).to.have.length( 3 );
		} );

		it( 'should render postal code field when the cart contains only a Google App ', () => {
			needsOnlyGoogleAppsDetailsStub.returns( true );
			const wrapper = shallow( <DomainDetailsForm { ...defaultProps } /> );
			wrapper.find( 'CountrySelect' ).simulate( 'change', { target: {
				value: 'AU',
				name: 'countryCode'
			} } );

			const inputs = wrapper.find( '.checkout__domain-details-fieldset Input' );
			expect( inputs ).to.have.length( 1 );
			expect( inputs.get( 0 ).props.name ).to.equal( 'postal-code' );
		} );
	} );
} );
