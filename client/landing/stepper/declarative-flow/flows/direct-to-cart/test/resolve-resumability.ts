/**
 * @jest-environment jsdom
 */
import { resolveResumability } from '../resolve-resumability';
import { writeResumeRecord, resumeKey, readResumeRecord } from '../resume-storage';

describe( 'resolveResumability', () => {
	beforeEach( () => {
		window.localStorage.clear();
	} );

	it( 'returns kind=create when no record exists', async () => {
		const result = await resolveResumability( {
			integration: 'telex',
			contextId: 'proj-1',
			plan: 'business-bundle',
			fetchSitePlanStatus: jest.fn(),
		} );
		expect( result.kind ).toBe( 'create' );
	} );

	it( 'returns kind=create when stored plan differs from requested', async () => {
		writeResumeRecord( resumeKey( 'telex', 'proj-1' ), {
			siteSlug: 'a.wordpress.com',
			plan: 'business-bundle',
		} );
		const result = await resolveResumability( {
			integration: 'telex',
			contextId: 'proj-1',
			plan: 'ecommerce-bundle',
			fetchSitePlanStatus: jest.fn(),
		} );
		expect( result.kind ).toBe( 'create' );
	} );

	it( 'returns kind=purchased when API reports plan is active', async () => {
		writeResumeRecord( resumeKey( 'telex', 'proj-1' ), {
			siteSlug: 'a.wordpress.com',
			plan: 'business-bundle',
		} );
		const result = await resolveResumability( {
			integration: 'telex',
			contextId: 'proj-1',
			plan: 'business-bundle',
			fetchSitePlanStatus: jest.fn().mockResolvedValue( { status: 'active' } ),
		} );
		expect( result.kind ).toBe( 'purchased' );
		expect( ( result as { siteSlug: string } ).siteSlug ).toBe( 'a.wordpress.com' );
	} );

	it( 'returns kind=unpurchased when API reports plan is pending or absent', async () => {
		writeResumeRecord( resumeKey( 'telex', 'proj-1' ), {
			siteSlug: 'a.wordpress.com',
			plan: 'business-bundle',
		} );
		const result = await resolveResumability( {
			integration: 'telex',
			contextId: 'proj-1',
			plan: 'business-bundle',
			fetchSitePlanStatus: jest.fn().mockResolvedValue( { status: 'pending' } ),
		} );
		expect( result.kind ).toBe( 'unpurchased' );
	} );

	it( 'clears the stale record and returns kind=create when API throws', async () => {
		writeResumeRecord( resumeKey( 'telex', 'proj-1' ), {
			siteSlug: 'a.wordpress.com',
			plan: 'business-bundle',
		} );
		const result = await resolveResumability( {
			integration: 'telex',
			contextId: 'proj-1',
			plan: 'business-bundle',
			fetchSitePlanStatus: jest.fn().mockRejectedValue( new Error( '404' ) ),
		} );
		expect( result.kind ).toBe( 'create' );
		expect( ( result as { apiError?: boolean } ).apiError ).toBe( true );
		expect( readResumeRecord( resumeKey( 'telex', 'proj-1' ) ) ).toBeNull();
	} );
} );
