import config from '@automattic/calypso-config';
import { isPremiumPlan } from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import { ONBOARD_STORE } from '../stores';
import { useSite } from './use-site';
import type { OnboardSelect } from '@automattic/data-stores';

export function useIsBigSkyEligible(): boolean | null {
	const site = useSite();
	const productSlug = site?.plan?.product_slug || '';
	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[ site ]
	);
	const validGoals = [ 'other', 'promote' ];

	const configEnabled = config.isEnabled( 'calypso/ai-assembler' );
	const hasValidGoal = goals.every( ( value ) => validGoals.includes( value ) );
	const isEligiblePlan = isPremiumPlan( productSlug );

	return configEnabled && isEligiblePlan && hasValidGoal;
}
