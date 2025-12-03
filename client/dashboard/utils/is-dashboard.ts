import config from '@automattic/calypso-config';

const dashboardEnvironments = [
	'dashboard-development',
	'dashboard-stage',
	'dashboard-horizon',
	'dashboard-production',
];

const isDashboard = (): boolean => dashboardEnvironments.includes( config( 'env_id' ) );

export default isDashboard;
