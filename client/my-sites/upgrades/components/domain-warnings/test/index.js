/**
 * External dependencies
 */
import { expect } from 'chai';
import assert from 'assert';
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
import support from 'lib/url/support';

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

	describe( 'rules', () => {
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
	} );

	describe( 'newDomain', () => {
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
	} );

	describe( 'mapped domain with wrong NS', () => {
		it( 'should render a warning for misconfigured mapped domains', () => {
			const props = {
				domains: [
					{ name: '1.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true }
				],
				selectedSite: { domain: '1.com' }
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( 'name server records should be configured' );
			assert( links.some( link => link.href === 'https://support.wordpress.com/domain-helper/?host=1.com' ) );
		} );

		it( 'should render the correct support url for multiple misconfigured mapped domains', () => {
			const props = {
				domains: [
					{ name: '1.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true },
					{ name: '2.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true }
				],
				selectedSite: { domain: '1.com' }
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			assert( links.some( link => link.href === support.MAP_EXISTING_DOMAIN_UPDATE_DNS ) );
		} );

		it( 'should show a subdomain mapping related message for one misconfigured subdomain', () => {
			const props = {
				domains: [
					{ name: 'blog.example.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true }
				],
				selectedSite: { domain: 'blog.example.com' }
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( 'CNAME records should be configured' );
			assert( links.some( link => link.href === support.MAP_SUBDOMAIN ) );
		} );

		it( 'should show a subdomain mapping related message for multiple misconfigured subdomains', () => {
			const props = {
				domains: [
					{ name: 'blog.example.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true },
					{ name: 'blog.mygroovysite.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true }
				],
				selectedSite: { domain: 'blog.example.com' }
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( 'Some of your domains\' CNAME records should be configured' );
			assert( links.some( link => link.href === support.MAP_SUBDOMAIN ) );
		} );

		it( 'should show a subdomain mapping related message for multiple misconfigured subdomains and domains mixed', () => {
			const props = {
				domains: [
					{ name: 'blog.example.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true },
					{ name: 'mygroovysite.com', pointsToWpcom: false, type: domainTypes.MAPPED, currentUserCanManage: true }
				],
				selectedSite: { domain: 'blog.example.com' }
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( 'Some of your domains\' name server records should be configured' );
			assert( links.some( link => link.href === support.MAP_EXISTING_DOMAIN_UPDATE_DNS ) );
		} );
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
