/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import identity from 'lodash/identity';
import moment from 'moment';
import ReactDom from 'react-dom';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { type as domainTypes } from 'lib/domains/constants';
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

describe( 'index', () => {
	let DomainWarnings;

	useFakeDom();

	useMockery( mockery => {
		mockery.registerMock( 'lib/analytics', {} );
		DomainWarnings = require( '../' );
	} );

	beforeEach( () => {
		DomainWarnings.prototype.translate = identity;
		Notice.prototype.translate = identity;
	} );

	afterEach( () => {
		delete DomainWarnings.prototype.translate;
		delete Notice.prototype.translate;
	} );

	it( 'should not render anything if there\'s no need', () => {
		const props = {
			domain: {
				name: 'example.com'
			},
			selectedSite: {}
		};

		const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

		expect( ReactDom.findDOMNode( component ) ).to.be.a( 'null' );
	} );

	it( 'should render new warning notice if the domain is new', () => {
		const props = {
			domain: {
				name: 'example.com',
				registrationMoment: moment(),
				type: domainTypes.REGISTERED,
				currentUserCanManage: true
			},
			selectedSite: { domain: 'example.wordpress.com' }
		};

		const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

		expect( ReactDom.findDOMNode( component ).textContent ).to.contain( 'We are setting up %(domainName)s for you' );
	} );

	it( 'should render the highest priority notice when there are others', () => {
		const props = {
			domain: {
				name: 'example.com',
				registrationMoment: moment(),
				type: domainTypes.REGISTERED,
				currentUserCanManage: true
			},
			selectedSite: { domain: 'example.com' }
		};

		const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

		expect( ReactDom.findDOMNode( component ).textContent ).to.contain( 'If you are unable to access your site at %(domainName)s' );
	} );

	it( 'should render the multi version of the component if more than two domains match the same rule', () => {
		const props = {
			domains: [
				{ name: '1.com', registrationMoment: moment(), type: domainTypes.REGISTERED, currentUserCanManage: true },
				{ name: '2.com', registrationMoment: moment(), type: domainTypes.REGISTERED, currentUserCanManage: true },
			],
			selectedSite: { domain: 'example.com' }
		};

		const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

		expect( ReactDom.findDOMNode( component ).textContent ).to.contain( 'We are setting up your new domains for you' );
	} );

	describe( 'Mutations', () => {
		it( 'should not mutate domain objects', () => {
			const props = {
				domain: {
					name: '1.com',
					registrationMoment: moment( '1999-09-09', 'YYYY-MM-DD' ),
					expirationMoment: moment( '2000-09-09', 'YYYY-MM-DD' )
				},
				selectedSite: { domain: '1.com' }
			};

			TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( props.domain.name ).to.equal( '1.com' );
			assert( props.domain.registrationMoment.isSame( moment( '1999-09-09', 'YYYY-MM-DD' ) ) );
			assert( props.domain.expirationMoment.isSame( moment( '2000-09-09', 'YYYY-MM-DD' ) ) );
		} );
	} );

	describe( 'Ruleset filtering', () => {
		it( 'should only process whitelisted renderers', () => {
			const props = {
				domain: { name: 'example.com' },
				ruleWhiteList: [],
				selectedSite: {}
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( component.getPipe().length ).to.equal( 0 );
		} );

		it( 'should not allow running extra functions other than defined in getPipe()', () => {
			const props = {
				domain: { name: 'example.com' },
				ruleWhiteList: [ 'getDomains' ],
				selectedSite: {}
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( component.getPipe().length ).to.equal( 0 );
		} );
	} );
} );
