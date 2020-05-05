/**
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
import { domainRegistration } from 'lib/cart-values/cart-items';

jest.mock( 'lib/analytics/page-view', () => ( {
	recordPageView: () => {},
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

	const domainProduct = domainRegistration( {
		productSlug: 'normal_domain',
		domain: 'test.test',
	} );

	const domainProductWithExplicitPrivacy = domainRegistration( {
		productSlug: 'normal_domain',
		domain: 'test.test',
		extra: {
			privacy_available: true,
		},
	} );

	const domainProductWithoutPrivacy = domainRegistration( {
		productSlug: 'unprivate_domain',
		extra: {
			privacy_available: false,
		},
	} );

	const textWhenPrivacyIsSupported =
		'We have pre-filled the required contact information from your WordPress.com account. Privacy Protection is included to help protect your personal information. {{a}}Learn more{{/a}}';
	const textWhenPrivacyIsSomewhatSupported =
		'We have pre-filled the required contact information from your WordPress.com account. Privacy Protection is included for all eligible domains to help protect your personal information. {{a}}Learn more{{/a}}';
	const textWhenPrivacyIsNotSupported =
		'We have pre-filled the required contact information from your WordPress.com account. Privacy Protection is unavailable for domains in your cart.';

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

		expect( wrapper.find( 'p' ) ).to.have.length( 0 );
	} );

	test( 'should render the privacy text with a domain with privacy support', () => {
		const propsWithDomain = merge( {}, defaultProps, {
			cart: { products: [ domainProductWithExplicitPrivacy ] },
		} );

		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomain } /> );

		expect( wrapper.find( 'p' ) ).to.have.length( 1 );
		expect( wrapper.find( 'p' ).text() ).to.equal( textWhenPrivacyIsSupported );
	} );

	test( 'should render privacy text for domain with support', () => {
		const propsWithDomainWithPrivacy = merge( {}, defaultProps, {
			cart: { products: [ domainProduct ] },
		} );

		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomainWithPrivacy } /> );

		expect( wrapper.find( 'p' ) ).to.have.length( 1 );
		expect( wrapper.find( 'p' ).text() ).to.equal( textWhenPrivacyIsSupported );
	} );

	test( "should not render the privacy text with a domain that doesn't support privacy", () => {
		const propsWithDomainWithNoPrivacy = merge( {}, defaultProps, {
			cart: { products: [ domainProductWithoutPrivacy ] },
		} );
		const wrapper = shallow( <DomainDetailsForm { ...propsWithDomainWithNoPrivacy } /> );

		expect( wrapper.find( 'p' ) ).to.have.length( 1 );
		expect( wrapper.find( 'p' ).text() ).to.equal( textWhenPrivacyIsNotSupported );
	} );

	test( 'should render the privacy text with mixed privacy support', () => {
		const mixedSupportProps = merge( {}, defaultProps, {
			cart: { products: [ domainProductWithExplicitPrivacy, domainProductWithoutPrivacy ] },
		} );
		const wrapper = shallow( <DomainDetailsForm { ...mixedSupportProps } /> );

		expect( wrapper.find( 'p' ) ).to.have.length( 1 );
		expect( wrapper.find( 'p' ).text() ).to.equal( textWhenPrivacyIsSomewhatSupported );
	} );

	test( 'should render privacy text without explicit privacy support', () => {
		const mixedSupportProps = merge( {}, defaultProps, { cart: { products: [ domainProduct ] } } );
		const wrapper = shallow( <DomainDetailsForm { ...mixedSupportProps } /> );

		expect( wrapper.find( 'p' ) ).to.have.length( 1 );
		expect( wrapper.find( 'p' ).text() ).to.equal( textWhenPrivacyIsSupported );
	} );
} );
