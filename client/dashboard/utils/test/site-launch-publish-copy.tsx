/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useExperiment } from 'calypso/lib/explat';
import { AppProvider, APP_CONTEXT_DEFAULT_CONFIG } from '../../app/context';
import {
	SITE_LAUNCH_PUBLISH_COPY_EXPERIMENT,
	isEligibleForSiteLaunchPublishCopy,
	useSiteLaunchPublishCopy,
} from '../site-launch-publish-copy';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: jest.fn(),
} ) );

const mockUseExperiment = jest.mocked( useExperiment );

const eligibleInput = {
	launchStatus: 'unlaunched',
	canManageOptions: true,
	isA4ADevSite: false,
};

function createExperimentAssignment( variationName: string | null ) {
	return {
		experimentName: SITE_LAUNCH_PUBLISH_COPY_EXPERIMENT,
		variationName,
		retrievedTimestamp: Date.now(),
		ttl: 60,
	};
}

describe( 'isEligibleForSiteLaunchPublishCopy', () => {
	it( 'accepts an admin of an unlaunched site', () => {
		expect( isEligibleForSiteLaunchPublishCopy( eligibleInput ) ).toBe( true );
	} );

	it.each( [
		[ 'a launched site', { launchStatus: 'launched' } ],
		[ 'an unknown launch status', { launchStatus: undefined } ],
		[ 'a user who cannot launch the site', { canManageOptions: false } ],
		[ 'an A4A dev site', { isA4ADevSite: true } ],
		[ 'a surface that is not showing an entry point', { isEntryPointShown: false } ],
	] )( 'rejects %s', ( _, override ) => {
		expect( isEligibleForSiteLaunchPublishCopy( { ...eligibleInput, ...override } ) ).toBe( false );
	} );
} );

describe( 'useSiteLaunchPublishCopy', () => {
	beforeEach( () => {
		mockUseExperiment.mockReset();
	} );

	it( 'keeps an ineligible user out of the experiment and returns the control', () => {
		mockUseExperiment.mockReturnValue( [ false, null ] );

		const { result } = renderHook( () =>
			useSiteLaunchPublishCopy( { ...eligibleInput, launchStatus: 'launched' } )
		);

		expect( mockUseExperiment ).toHaveBeenCalledWith( SITE_LAUNCH_PUBLISH_COPY_EXPERIMENT, {
			isEligible: false,
		} );
		expect( result.current ).toEqual( { isLoading: false, usePublishCopy: false } );
	} );

	it( 'keeps agency dashboard users out of the experiment', () => {
		mockUseExperiment.mockReturnValue( [ false, createExperimentAssignment( 'treatment' ) ] );
		const config = {
			...APP_CONTEXT_DEFAULT_CONFIG,
			supports: { ...APP_CONTEXT_DEFAULT_CONFIG.supports, agency: {} },
		} as typeof APP_CONTEXT_DEFAULT_CONFIG;

		const { result } = renderHook( () => useSiteLaunchPublishCopy( eligibleInput ), {
			wrapper: ( { children } ) => <AppProvider config={ config }>{ children }</AppProvider>,
		} );

		expect( mockUseExperiment ).toHaveBeenCalledWith( SITE_LAUNCH_PUBLISH_COPY_EXPERIMENT, {
			isEligible: false,
		} );
		expect( result.current ).toEqual( { isLoading: false, usePublishCopy: false } );
	} );

	it( 'reports loading while the assignment is pending', () => {
		mockUseExperiment.mockReturnValue( [ true, null ] );

		const { result } = renderHook( () => useSiteLaunchPublishCopy( eligibleInput ) );

		expect( result.current ).toEqual( { isLoading: true, usePublishCopy: false } );
	} );

	it( 'returns the publish copy for the treatment', () => {
		mockUseExperiment.mockReturnValue( [ false, createExperimentAssignment( 'treatment' ) ] );

		const { result } = renderHook( () => useSiteLaunchPublishCopy( eligibleInput ) );

		expect( mockUseExperiment ).toHaveBeenCalledWith( SITE_LAUNCH_PUBLISH_COPY_EXPERIMENT, {
			isEligible: true,
		} );
		expect( result.current ).toEqual( { isLoading: false, usePublishCopy: true } );
	} );

	it.each( [ 'control', null ] )(
		'returns the launch copy for the %s assignment',
		( variation ) => {
			mockUseExperiment.mockReturnValue( [ false, createExperimentAssignment( variation ) ] );

			const { result } = renderHook( () => useSiteLaunchPublishCopy( eligibleInput ) );

			expect( result.current ).toEqual( { isLoading: false, usePublishCopy: false } );
		}
	);
} );
