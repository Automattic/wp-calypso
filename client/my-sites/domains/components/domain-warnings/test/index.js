/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import { expect } from 'chai';
import { identity } from 'lodash';
import moment from 'moment';
import React from 'react';
import TestUtils from 'react-dom/test-utils';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import { DomainWarnings } from '../';
import { type as domainTypes } from 'lib/domains/constants';
import { MAP_EXISTING_DOMAIN_UPDATE_DNS, MAP_SUBDOMAIN } from 'lib/url/support';

jest.mock( 'lib/analytics', () => ( {} ) );

describe( 'index', () => {
	describe( 'rules', () => {
		test( "should not render anything if there's no need", () => {
			const props = {
				translate: identity,
				domain: {
					name: 'example.com',
				},
				selectedSite: {},
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ) ).to.be.a( 'null' );
		} );

		test( 'should render the highest priority notice when there are others', () => {
			const props = {
				translate: identity,
				domain: {
					name: 'example.com',
					registrationMoment: moment(),
					type: domainTypes.REGISTERED,
					currentUserCanManage: true,
				},
				selectedSite: { domain: 'example.com' },
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ).textContent ).to.contain(
				'If you are unable to access your site at {{strong}}%(domainName)s{{/strong}}'
			);
		} );
	} );

	describe( 'newDomain', () => {
		test( 'should render new warning notice if the domain is new', () => {
			const props = {
				translate: identity,
				domain: {
					name: 'example.com',
					registrationMoment: moment(),
					type: domainTypes.REGISTERED,
					currentUserCanManage: true,
				},
				selectedSite: { domain: 'example.wordpress.com' },
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ).textContent ).to.contain(
				'We are setting up {{strong}}%(domainName)s{{/strong}} for you'
			);
		} );

		test( 'should render the multi version of the component if more than two domains match the same rule', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: '1.com',
						registrationMoment: moment(),
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
					},
					{
						name: '2.com',
						registrationMoment: moment(),
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
					},
				],
				selectedSite: { domain: 'example.com' },
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ).textContent ).to.contain(
				'We are setting up your new domains for you'
			);
		} );
	} );

	describe( 'mapped domain with wrong NS', () => {
		test( 'should render a warning for misconfigured mapped domains', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: '1.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
				],
				selectedSite: { domain: '1.com' },
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( 'name server records need to be configured' );
			assert(
				links.some(
					link => link.href === 'https://en.support.wordpress.com/domain-helper/?host=1.com'
				)
			);
		} );

		test( 'should render the correct support url for multiple misconfigured mapped domains', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: '1.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
					{
						name: '2.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
				],
				selectedSite: { domain: '1.com' },
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			assert( links.some( link => link.href === MAP_EXISTING_DOMAIN_UPDATE_DNS ) );
		} );

		test( 'should show a subdomain mapping related message for one misconfigured subdomain', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
				],
				selectedSite: { domain: 'blog.example.com' },
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( 'DNS records need to be configured' );
			assert( links.some( link => link.href === MAP_SUBDOMAIN ) );
		} );

		test( 'should show a subdomain mapping related message for multiple misconfigured subdomains', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
					{
						name: 'blog.mygroovysite.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
				],
				selectedSite: { domain: 'blog.example.com' },
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( "Some of your domains' DNS records need to be configured" );
			assert( links.some( link => link.href === MAP_SUBDOMAIN ) );
		} );

		test( 'should show a subdomain mapping related message for multiple misconfigured subdomains and domains mixed', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
					{
						name: 'mygroovysite.com',
						pointsToWpcom: false,
						type: domainTypes.MAPPED,
						currentUserCanManage: true,
					},
				],
				selectedSite: { domain: 'blog.example.com' },
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain(
				"Some of your domains' name server records need to be configured"
			);
			assert( links.some( link => link.href === MAP_EXISTING_DOMAIN_UPDATE_DNS ) );
		} );
	} );

	describe( 'verification nudge', () => {
		test( 'should show a verification nudge with weak message for any unverified domains younger than 2 days', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationMoment: moment().subtract( 1, 'days' ),
					},
					{
						name: 'mygroovysite.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationMoment: moment().subtract( 1, 'days' ),
					},
				],
				selectedSite: { domain: 'blog.example.com', slug: 'blog.example.com' },
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain( 'lease verify ownership of domains' );
			assert(
				links.some( link =>
					link.href.endsWith( '/domains/manage/blog.example.com/edit/blog.example.com' )
				)
			);
			assert(
				links.some( link =>
					link.href.endsWith( '/domains/manage/mygroovysite.com/edit/blog.example.com' )
				)
			);
		} );

		test( 'should show a verification nudge with strong message for any unverified domains older than 2 days', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationMoment: moment().subtract( 3, 'days' ),
					},
					{
						name: 'mygroovysite.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationMoment: moment().subtract( 3, 'days' ),
					},
				],
				selectedSite: { domain: 'blog.example.com', slug: 'blog.example.com' },
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).to.contain(
				'Your domains may be suspended because your email address is not verified.'
			);
			assert(
				links.some( link =>
					link.href.endsWith( '/domains/manage/blog.example.com/edit/blog.example.com' )
				)
			);
			assert(
				links.some( link =>
					link.href.endsWith( '/domains/manage/mygroovysite.com/edit/blog.example.com' )
				)
			);
		} );

		test( "should show a verification nudge with strong message for users who can't manage the domain", () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: false,
						isPendingIcannVerification: true,
						registrationMoment: moment().subtract( 1, 'days' ),
					},
					{
						name: 'mygroovysite.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: false,
						isPendingIcannVerification: true,
						registrationMoment: moment().subtract( 1, 'days' ),
					},
				],
				selectedSite: { domain: 'blog.example.com', slug: 'blog.example.com' },
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent;

			expect( textContent ).to.contain(
				'Some domains on this site are about to be suspended because their owner has not'
			);
		} );
	} );

	describe( 'Mutations', () => {
		test( 'should not mutate domain objects', () => {
			const props = {
				translate: identity,
				domain: {
					name: '1.com',
					registrationMoment: moment( '1999-09-09', 'YYYY-MM-DD' ),
					expirationMoment: moment( '2000-09-09', 'YYYY-MM-DD' ),
				},
				selectedSite: { domain: '1.com' },
			};

			TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( props.domain.name ).to.equal( '1.com' );
			assert( props.domain.registrationMoment.isSame( moment( '1999-09-09', 'YYYY-MM-DD' ) ) );
			assert( props.domain.expirationMoment.isSame( moment( '2000-09-09', 'YYYY-MM-DD' ) ) );
		} );
	} );

	describe( 'Ruleset filtering', () => {
		test( 'should only process whitelisted renderers', () => {
			const props = {
				translate: identity,
				domain: { name: 'example.com' },
				ruleWhiteList: [],
				selectedSite: {},
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( component.getPipe().length ).to.equal( 0 );
		} );

		test( 'should not allow running extra functions other than defined in getPipe()', () => {
			const props = {
				translate: identity,
				domain: { name: 'example.com' },
				ruleWhiteList: [ 'getDomains' ],
				selectedSite: {},
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( component.getPipe().length ).to.equal( 0 );
		} );
	} );
} );
