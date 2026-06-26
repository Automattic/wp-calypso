/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { dangerouslyGetExperimentAssignment } from 'calypso/lib/explat';
import {
	DOMAIN_BUNDLE_EXPERIMENT_NAME,
	isDomainBundleExperienceEnabled,
} from '../bundle-experiment';
import type { ExperimentAssignment } from '@automattic/explat-client';

const mockConfig = config as unknown as { isEnabled: jest.Mock };
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

jest.mock( 'calypso/lib/explat', () => ( {
	dangerouslyGetExperimentAssignment: jest.fn(),
} ) );

const mockDangerouslyGetExperimentAssignment =
	dangerouslyGetExperimentAssignment as jest.MockedFunction<
		typeof dangerouslyGetExperimentAssignment
	>;

const buildAssignment = ( variationName: string | null ): ExperimentAssignment => ( {
	experimentName: DOMAIN_BUNDLE_EXPERIMENT_NAME,
	variationName,
	retrievedTimestamp: Date.now(),
	ttl: 60,
} );

describe( 'isDomainBundleExperienceEnabled', () => {
	beforeEach( () => {
		mockConfig.isEnabled.mockReset();
		mockDangerouslyGetExperimentAssignment.mockReset();
		mockDangerouslyGetExperimentAssignment.mockReturnValue( buildAssignment( null ) );
	} );

	it( 'returns true when the domain-bundling flag is on, without reading the experiment', () => {
		mockConfig.isEnabled.mockImplementation( ( flag: string ) => flag === 'domain-bundling' );

		expect( isDomainBundleExperienceEnabled() ).toBe( true );
		expect( mockDangerouslyGetExperimentAssignment ).not.toHaveBeenCalled();
	} );

	it( 'returns true when the flag is off but the user is assigned treatment', () => {
		mockConfig.isEnabled.mockReturnValue( false );
		mockDangerouslyGetExperimentAssignment.mockReturnValue( buildAssignment( 'treatment' ) );

		expect( isDomainBundleExperienceEnabled() ).toBe( true );
		expect( mockDangerouslyGetExperimentAssignment ).toHaveBeenCalledWith(
			DOMAIN_BUNDLE_EXPERIMENT_NAME
		);
	} );

	it( 'returns false when the flag is off and the assignment is control', () => {
		mockConfig.isEnabled.mockReturnValue( false );
		mockDangerouslyGetExperimentAssignment.mockReturnValue( buildAssignment( 'control' ) );

		expect( isDomainBundleExperienceEnabled() ).toBe( false );
	} );

	it( 'returns false when the flag is off and no assignment has been made yet', () => {
		mockConfig.isEnabled.mockReturnValue( false );
		mockDangerouslyGetExperimentAssignment.mockReturnValue( buildAssignment( null ) );

		expect( isDomainBundleExperienceEnabled() ).toBe( false );
	} );
} );
