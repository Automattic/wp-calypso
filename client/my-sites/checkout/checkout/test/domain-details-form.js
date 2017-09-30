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

describe( 'Domain Details Form', () => {
	const defaultProps = {
		productsList: {},
		cart: {
			products: [],
		},
		contactDetails: {
		},
		translate: identity,
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
} );
