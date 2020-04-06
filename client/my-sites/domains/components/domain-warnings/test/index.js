/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
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
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ) ).toBeNull();
		} );

		test( 'should render the highest priority notice when there are others', () => {
			const props = {
				translate: identity,
				domain: {
					name: 'example.com',
					registrationDate: new Date().toISOString(),
					type: domainTypes.REGISTERED,
					currentUserCanManage: true,
				},
				selectedSite: { domain: 'example.com' },
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ).textContent ).toContain(
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
					registrationDate: new Date().toISOString(),
					type: domainTypes.REGISTERED,
					currentUserCanManage: true,
				},
				selectedSite: { domain: 'example.wordpress.com' },
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ).textContent ).toContain(
				'We are setting up {{strong}}%(domainName)s{{/strong}} for you'
			);
		} );

		test( 'should render the multi version of the component if more than two domains match the same rule', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: '1.com',
						registrationDate: new Date().toISOString(),
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
					},
					{
						name: '2.com',
						registrationDate: new Date().toISOString(),
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
					},
				],
				selectedSite: { domain: 'example.com' },
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( ReactDom.findDOMNode( component ).textContent ).toContain(
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
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).toContain( 'contact your domain registrar' );
			expect(
				links.some(
					link =>
						link.href ===
						'https://wordpress.com/support/domains/map-existing-domain/#change-your-domains-name-servers'
				)
			).toBeTruthy();
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
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( links.some( link => link.href === MAP_EXISTING_DOMAIN_UPDATE_DNS ) ).toBeTruthy();
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
				moment,
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).toContain( 'DNS records need to be configured' );
			expect( links.some( link => link.href === MAP_SUBDOMAIN ) ).toBeTruthy();
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
				moment,
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).toContain( "Some of your domains' DNS records need to be configured" );
			expect( links.some( link => link.href === MAP_SUBDOMAIN ) ).toBeTruthy();
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
				moment,
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).toContain(
				"Some of your domains' name server records need to be configured"
			);
			expect( links.some( link => link.href === MAP_EXISTING_DOMAIN_UPDATE_DNS ) ).toBeTruthy();
		} );
	} );

	describe( 'verification nudge', () => {
		test( 'should not show any verification nudge for any unverified domains younger than 2 days if site is FSE eligible', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationDate: moment()
							.subtract( 1, 'days' )
							.toISOString(),
					},
					{
						name: 'mygroovysite.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationDate: moment()
							.subtract( 1, 'days' )
							.toISOString(),
					},
				],
				selectedSite: { domain: 'blog.example.com', slug: 'blog.example.com' },
				isSiteEligibleForFSE: true,
				siteIsUnlaunched: true,
				moment,
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode ? domNode.textContent : '',
				links = domNode ? [].slice.call( domNode.querySelectorAll( 'a' ) ) : [];

			expect( textContent ).not.toContain( 'Please verify ownership of domains' );
			expect(
				links.some( link =>
					link.href.endsWith( '/domains/manage/blog.example.com/edit/blog.example.com' )
				)
			).toBeFalsy();
			expect(
				links.some( link =>
					link.href.endsWith( '/domains/manage/mygroovysite.com/edit/blog.example.com' )
				)
			).toBeFalsy();
		} );
		test( 'should show a verification nudge with weak message for any unverified domains younger than 2 days', () => {
			const props = {
				translate: identity,
				domains: [
					{
						name: 'blog.example.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationDate: moment()
							.subtract( 1, 'days' )
							.toISOString(),
					},
					{
						name: 'mygroovysite.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationDate: moment()
							.subtract( 1, 'days' )
							.toISOString(),
					},
				],
				selectedSite: { domain: 'blog.example.com', slug: 'blog.example.com' },
				moment,
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).toContain( 'Please verify ownership of domains' );
			expect(
				links.some( link =>
					link.href.endsWith( '/domains/manage/blog.example.com/edit/blog.example.com' )
				)
			).toBeTruthy();
			expect(
				links.some( link =>
					link.href.endsWith( '/domains/manage/mygroovysite.com/edit/blog.example.com' )
				)
			).toBeTruthy();
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
						registrationDate: moment()
							.subtract( 3, 'days' )
							.toISOString(),
					},
					{
						name: 'mygroovysite.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: true,
						isPendingIcannVerification: true,
						registrationDate: moment()
							.subtract( 3, 'days' )
							.toISOString(),
					},
				],
				selectedSite: { domain: 'blog.example.com', slug: 'blog.example.com' },
				moment,
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component ),
				textContent = domNode.textContent,
				links = [].slice.call( domNode.querySelectorAll( 'a' ) );

			expect( textContent ).toContain(
				'Your domains may be suspended because your email address is not verified.'
			);
			expect(
				links.some( link =>
					link.href.endsWith( '/domains/manage/blog.example.com/edit/blog.example.com' )
				)
			).toBeTruthy();
			expect(
				links.some( link =>
					link.href.endsWith( '/domains/manage/mygroovysite.com/edit/blog.example.com' )
				)
			).toBeTruthy();
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
						registrationDate: moment()
							.subtract( 1, 'days' )
							.toISOString(),
					},
					{
						name: 'mygroovysite.com',
						type: domainTypes.REGISTERED,
						currentUserCanManage: false,
						isPendingIcannVerification: true,
						registrationDate: moment()
							.subtract( 1, 'days' )
							.toISOString(),
					},
				],
				selectedSite: { domain: 'blog.example.com', slug: 'blog.example.com' },
				moment,
			};
			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			const domNode = ReactDom.findDOMNode( component );
			const textContent = domNode.textContent;

			expect( textContent ).toContain(
				'Some domains on this site are about to be suspended because their owner has not'
			);
		} );
	} );

	describe( 'Ruleset filtering', () => {
		test( 'should only process whitelisted renderers', () => {
			const props = {
				translate: identity,
				domain: { name: 'example.com' },
				ruleWhiteList: [],
				selectedSite: {},
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( component.getPipe().length ).toBe( 0 );
		} );

		test( 'should not allow running extra functions other than defined in getPipe()', () => {
			const props = {
				translate: identity,
				domain: { name: 'example.com' },
				ruleWhiteList: [ 'getDomains' ],
				selectedSite: {},
				moment,
			};

			const component = TestUtils.renderIntoDocument( <DomainWarnings { ...props } /> );

			expect( component.getPipe().length ).toBe( 0 );
		} );
	} );
} );
