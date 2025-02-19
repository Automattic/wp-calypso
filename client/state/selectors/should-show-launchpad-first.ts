import { SiteDetails, Onboard } from '@automattic/data-stores';
import { useEffect, useState } from 'react';
import { loadExperimentAssignment } from 'calypso/lib/explat';

const SiteIntent = Onboard.SiteIntent;

/**
 * Determines if the launchpad should be shown first based on site createion flow
 * @param site Site object
 * @returns Whether launchpad should be shown first
 */
export const shouldShowLaunchpadFirst = async ( site: SiteDetails ): Promise< boolean > => {
	const wasSiteCreatedOnboardingFlow = site.options?.site_creation_flow === 'onboarding';
	const createdAfterExperimentStart =
		( site.options?.created_at ?? '' ) > '2025-02-03T10:22:45+00:00'; // If created_at is null then this expression is false
	const isBigSkyIntent = site?.options?.site_intent === SiteIntent.AIAssembler;

	if ( isBigSkyIntent || ! wasSiteCreatedOnboardingFlow || ! createdAfterExperimentStart ) {
		return false;
	}

	const assignment = await loadExperimentAssignment(
		'calypso_signup_onboarding_goals_first_flow_holdout_v2_20250131'
	);

	return assignment?.variationName === 'treatment_cumulative';
};

export const useShouldShowLaunchpadFirst = ( site?: SiteDetails | null ): [ boolean, boolean ] => {
	const [ state, setState ] = useState< boolean | 'loading' >( 'loading' );

	useEffect( () => {
		let cancel = false;

		const getResponse = async () => {
			if ( ! site ) {
				return;
			}

			try {
				setState( 'loading' );
				const result = await shouldShowLaunchpadFirst( site );
				if ( ! cancel ) {
					setState( result );
				}
			} catch ( err ) {
				if ( ! cancel ) {
					setState( false );
				}
			}
		};

		getResponse();

		return () => {
			cancel = true;
		};
	}, [ site ] );

	if ( ! site ) {
		// If the site isn't available yet we'll assume we're still loading
		return [ true, false ];
	}

	return [ state === 'loading', state === 'loading' ? false : state ];
};
