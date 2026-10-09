/**
 * @jest-environment jsdom
 */
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import {
	getSignupCompleteFlowName,
	getSignupCompleteSiteID,
	getSignupCompleteSlug,
	retrieveSignupDestination,
} from 'calypso/signup/storageUtils';
import { isPlanFirstCommerce, isPlanFirstCommerceResume } from '../plan-first-commerce';

jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteFlowName: jest.fn(),
	getSignupCompleteSiteID: jest.fn(),
	getSignupCompleteSlug: jest.fn(),
	retrieveSignupDestination: jest.fn(),
} ) );

const makeQuery = ( plan = 'ecommerce-bundle' ) =>
	new URLSearchParams( { plan_first: 'true', showDomainStep: '', plan } );

describe( 'plan-first Commerce progress', () => {
	it.each( [
		'ecommerce-bundle',
		'ecommerce-bundle-monthly',
		'ecommerce-bundle-2y',
		'ecommerce-bundle-3y',
	] )( 'opts in paid Commerce term %s', ( plan ) => {
		expect( isPlanFirstCommerce( NEW_HOSTED_SITE_FLOW, makeQuery( plan ) ) ).toBe( true );
	} );

	it.each( [
		'personal-bundle',
		'business-bundle',
		'wp_bundle',
		'ecommerce-trial-bundle-monthly',
		'invalid',
	] )( 'keeps other plans and trials out: %s', ( plan ) => {
		expect( isPlanFirstCommerce( NEW_HOSTED_SITE_FLOW, makeQuery( plan ) ) ).toBe( false );
	} );

	it.each( [ 'plan_first', 'showDomainStep', 'plan' ] )( 'requires %s', ( param ) => {
		const query = makeQuery();
		query.delete( param );
		expect( isPlanFirstCommerce( NEW_HOSTED_SITE_FLOW, query ) ).toBe( false );
	} );

	it( 'does not change another flow', () => {
		expect( isPlanFirstCommerce( 'onboarding', makeQuery() ) ).toBe( false );
	} );
} );

describe( 'Commerce checkout return', () => {
	beforeEach( () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( NEW_HOSTED_SITE_FLOW );
		jest.mocked( getSignupCompleteSlug ).mockReturnValue( 'example.wordpress.com' );
		jest.mocked( getSignupCompleteSiteID ).mockReturnValue( '123' );
		jest.mocked( retrieveSignupDestination ).mockReturnValue( '/setup/transferring-hosted-site' );
	} );

	const returnQuery = () => {
		const query = makeQuery();
		query.set( 'siteSlug', 'example.wordpress.com' );
		query.set( 'siteId', '123' );
		return query;
	};

	it( 'resumes the same saved site', () => {
		expect( isPlanFirstCommerceResume( NEW_HOSTED_SITE_FLOW, returnQuery() ) ).toBe( true );
	} );

	it.each( [ 'siteSlug', 'siteId' ] )( 'rejects a different %s', ( param ) => {
		const query = returnQuery();
		query.set( param, 'another-site' );
		expect( isPlanFirstCommerceResume( NEW_HOSTED_SITE_FLOW, query ) ).toBe( false );
	} );

	it( 'rejects storage belonging to a different flow', () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( 'onboarding' );
		expect( isPlanFirstCommerceResume( NEW_HOSTED_SITE_FLOW, returnQuery() ) ).toBe( false );
	} );

	it( 'requires an unfinished checkout destination', () => {
		jest.mocked( retrieveSignupDestination ).mockReturnValue( '' );
		expect( isPlanFirstCommerceResume( NEW_HOSTED_SITE_FLOW, returnQuery() ) ).toBe( false );
	} );
} );
