import { serverEnvId } from '@automattic/calypso-config';

const dashboardEnvironments = [
	'dashboard-development',
	'dashboard-stage',
	'dashboard-horizon',
	'dashboard-production',
];

const isDashboardEnv = (): boolean =>
	!! serverEnvId && dashboardEnvironments.includes( serverEnvId );

export default isDashboardEnv;
