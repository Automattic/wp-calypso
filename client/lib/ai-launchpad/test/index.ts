import { loadExperimentAssignment } from 'calypso/lib/explat';
import {
	LAUNCHPAD_PERSONALIZATION_EXPERIMENT,
	normalizeVariation,
	getLaunchpadPersonalizationDestination,
	resolveLaunchpadPersonalizationVariation,
} from '../index';

jest.mock( 'calypso/lib/explat', () => ( {
	loadExperimentAssignment: jest.fn(),
} ) );

describe( 'launchpad personalization experiment', () => {
	it( 'exposes the agreed experiment name', () => {
		expect( LAUNCHPAD_PERSONALIZATION_EXPERIMENT ).toBe(
			'wpcom_launchpad_personalization_202607_v1'
		);
	} );

	describe( 'normalizeVariation', () => {
		it( 'maps the two treatment variation names', () => {
			expect( normalizeVariation( 'ai_launchpad' ) ).toBe( 'ai_launchpad' );
			expect( normalizeVariation( 'no_guidance' ) ).toBe( 'no_guidance' );
		} );

		it( 'treats control, unknown, null and undefined as control', () => {
			expect( normalizeVariation( 'control' ) ).toBe( 'control' );
			expect( normalizeVariation( 'something-else' ) ).toBe( 'control' );
			expect( normalizeVariation( null ) ).toBe( 'control' );
			expect( normalizeVariation( undefined ) ).toBe( 'control' );
		} );
	} );

	describe( 'resolveLaunchpadPersonalizationVariation', () => {
		beforeEach( () => jest.clearAllMocks() );

		it( 'forces ai_launchpad when the diy-launchpad override is present', async () => {
			await expect( resolveLaunchpadPersonalizationVariation( '1' ) ).resolves.toBe(
				'ai_launchpad'
			);
			expect( loadExperimentAssignment ).not.toHaveBeenCalled();
		} );

		it( 'reads the variation from ExPlat when no override is present', async () => {
			( loadExperimentAssignment as jest.Mock ).mockResolvedValue( {
				variationName: 'no_guidance',
			} );
			await expect( resolveLaunchpadPersonalizationVariation( null ) ).resolves.toBe(
				'no_guidance'
			);
			expect( loadExperimentAssignment ).toHaveBeenCalledWith(
				'wpcom_launchpad_personalization_202607_v1'
			);
		} );

		it( 'falls back to control on an unrecognized assignment', async () => {
			( loadExperimentAssignment as jest.Mock ).mockResolvedValue( { variationName: null } );
			await expect( resolveLaunchpadPersonalizationVariation( null ) ).resolves.toBe( 'control' );
		} );
	} );

	describe( 'getLaunchpadPersonalizationDestination', () => {
		const adminUrl = 'https://example.com/wp-admin/';

		it( 'returns null for control (caller falls through)', () => {
			expect(
				getLaunchpadPersonalizationDestination( { variation: 'control', adminUrl } )
			).toBeNull();
		} );

		it( 'sends ai_launchpad to Site Setup, enabling the AI launchpad when asked', () => {
			expect(
				getLaunchpadPersonalizationDestination( {
					variation: 'ai_launchpad',
					adminUrl,
					enableAiLaunchpad: true,
				} )
			).toBe(
				'https://example.com/wp-admin/admin.php?page=site-setup-wp-admin&enable-ai-launchpad=1'
			);
			expect(
				getLaunchpadPersonalizationDestination( { variation: 'ai_launchpad', adminUrl } )
			).toBe( 'https://example.com/wp-admin/admin.php?page=site-setup-wp-admin' );
		} );

		it( 'sends no_guidance to the wp-admin dashboard', () => {
			expect(
				getLaunchpadPersonalizationDestination( { variation: 'no_guidance', adminUrl } )
			).toBe( 'https://example.com/wp-admin/' );
		} );
	} );
} );
