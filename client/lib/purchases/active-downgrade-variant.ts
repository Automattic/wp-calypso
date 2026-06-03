import { isEnabled } from '@automattic/calypso-config';

export type ActiveDowngradeVariant = 'control' | 'instant' | 'on_renewal';

export function getActiveDowngradeVariant(): ActiveDowngradeVariant {
	if ( isEnabled( 'plans/scheduled-plan-downgrade' ) ) {
		return 'on_renewal';
	}
	if ( isEnabled( 'plans/active-plan-downgrade-instant' ) ) {
		return 'instant';
	}
	return 'control';
}
