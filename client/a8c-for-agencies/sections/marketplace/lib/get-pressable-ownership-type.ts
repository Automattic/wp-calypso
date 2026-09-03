import type { Agency } from 'calypso/state/a8c-for-agencies/types';

export type PressableOwnershipType = 'none' | 'regular' | 'agency';

export function getPressableOwnershipType( agency: Agency | null ): PressableOwnershipType {
	const hasPressablePlan = !! agency?.third_party?.pressable?.pressable_id;

	if ( ! hasPressablePlan ) {
		return 'none';
	}

	// A regular Pressable plan (not bought through the A4A marketplace) has a null A4A id.
	const hasRegularPressablePlan = agency?.third_party?.pressable?.a4a_id === null;

	return hasRegularPressablePlan ? 'regular' : 'agency';
}
