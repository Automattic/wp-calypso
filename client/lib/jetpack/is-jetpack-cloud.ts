import config from '@automattic/calypso-config';

const jetpackCloudEnvironments = [
	'jetpack-cloud-development',
	'jetpack-cloud-stage',
	'jetpack-cloud-horizon',
	'jetpack-cloud-production',
	// Todo: This is required to be able to use some Jetpack feature component in A4A
	'a8c-for-agencies-stage',
	'a8c-for-agencies-development',
	'a8c-for-agencies-horizon',
	'a8c-for-agencies-production',
];

const isJetpackCloud = (): boolean => jetpackCloudEnvironments.includes( config( 'env_id' ) );

export default isJetpackCloud;
