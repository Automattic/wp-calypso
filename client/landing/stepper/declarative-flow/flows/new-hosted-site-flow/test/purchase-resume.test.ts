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
import { isPurchaseResume } from '../purchase-resume';

jest.mock( 'calypso/signup/storageUtils', () => ( {
	getSignupCompleteFlowName: jest.fn(),
	getSignupCompleteSiteID: jest.fn(),
	getSignupCompleteSlug: jest.fn(),
	retrieveSignupDestination: jest.fn(),
} ) );

const makeQuery = () => new URLSearchParams( { showPurchaseSteps: 'true' } );

describe( 'Purchase checkout return', () => {
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
		expect( isPurchaseResume( returnQuery() ) ).toBe( true );
	} );

	it.each( [ 'siteSlug', 'siteId' ] )( 'rejects a different %s', ( param ) => {
		const query = returnQuery();
		query.set( param, 'another-site' );
		expect( isPurchaseResume( query ) ).toBe( false );
	} );

	it( 'rejects storage belonging to a different flow', () => {
		jest.mocked( getSignupCompleteFlowName ).mockReturnValue( 'onboarding' );
		expect( isPurchaseResume( returnQuery() ) ).toBe( false );
	} );

	it( 'requires an unfinished checkout destination', () => {
		jest.mocked( retrieveSignupDestination ).mockReturnValue( '' );
		expect( isPurchaseResume( returnQuery() ) ).toBe( false );
	} );
} );
