import { isEnabled } from '@automattic/calypso-config';
import { useEffect } from 'react';
import { loadExperimentAssignment } from 'calypso/lib/explat';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';

type SiteIdOrSlug = number | string | null;

const loadExperimentVariation = async () => {
	const assignment = await loadExperimentAssignment(
		'calypso_plans_global_styles_personal_20251124_v5'
	);

	// do something with assignment.variationName if you need it
	( window as any ).globalStylesPersonalVariation = assignment.variationName;
};

export function useSiteGlobalStylesOnPersonal( siteIdOrSlug: SiteIdOrSlug = null ): boolean {
	const { globalStylesInPersonalPlan } = useSiteGlobalStylesStatus( siteIdOrSlug );

	// Return true if global styles are enabled in the Personal Plan through feature flag or experiment.
	const isGlobalStylesOnPersonalEnabled =
		globalStylesInPersonalPlan || isEnabled( 'global-styles/on-personal-plan' );

	useEffect( () => {
		if ( typeof window !== 'undefined' ) {
			( window as any ).isGlobalStylesOnPersonal = isGlobalStylesOnPersonalEnabled;
			void loadExperimentVariation();
		}
	}, [ isGlobalStylesOnPersonalEnabled ] );

	return isGlobalStylesOnPersonalEnabled;
}
