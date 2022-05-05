import { isEnabled } from '@automattic/calypso-config';

export default function isStarterPlanEnabled(): boolean {
	return isEnabled( 'plans/starter-plan' );
}
