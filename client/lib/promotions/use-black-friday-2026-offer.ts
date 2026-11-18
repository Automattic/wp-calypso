import { useExperiment } from 'calypso/lib/explat';
import {
	BLACK_FRIDAY_2026_LIFECYCLE_EXPERIMENT,
	getBlackFriday2026OfferForVariation,
	isBlackFriday2026Active,
	type BlackFriday2026Offer,
} from './black-friday-2026';

/**
 * The Black Friday 2026 offer for the current user, or null when there is none to show:
 * outside the sale and while the assignment loads.
 */
export function useBlackFriday2026Offer(): BlackFriday2026Offer | null {
	const isActive = isBlackFriday2026Active();
	const [ isLoading, assignment ] = useExperiment( BLACK_FRIDAY_2026_LIFECYCLE_EXPERIMENT, {
		isEligible: isActive,
	} );

	if ( ! isActive || isLoading ) {
		return null;
	}
	return getBlackFriday2026OfferForVariation( assignment?.variationName );
}
