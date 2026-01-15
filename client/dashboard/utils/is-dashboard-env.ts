import config from '@automattic/calypso-config';

const dashboardEnvironments = [
	'dashboard-development',
	'dashboard-stage',
	'dashboard-horizon',
	'dashboard-production',
];

const isDashboardEnv = (): boolean => dashboardEnvironments.includes( config( 'env_id' ) );

export default isDashboardEnv;
