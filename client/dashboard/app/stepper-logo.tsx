import CiabDashboardStepperLogo from '../app-ciab/stepper-logo';
import type { DashboardType } from './types';

export function getDashboardStepperLogo( dashboard: DashboardType | undefined ) {
	if ( dashboard === 'ciab' ) {
		return <CiabDashboardStepperLogo />;
	}
	return null;
}
