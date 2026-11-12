import config from '@automattic/calypso-config';

const dashboardEnvironments = [
	'dashboard-development',
	'dashboard-stage',
	'dashboard-horizon',
	'dashboard-production',
];

const isDashboardEnv = ( envId = config< string >( 'env_id' ) ): boolean =>
	!! envId && dashboardEnvironments.includes( envId );

export default isDashboardEnv;
