/**
 * Internal dependencies
 */
import config from 'calypso/config';

const jetpackCloudEnvironments = [
	'jetpack-cloud-development',
	'jetpack-cloud-stage',
	'jetpack-cloud-horizon',
	'jetpack-cloud-production',
];

const isJetpackCloud = () => jetpackCloudEnvironments.includes( config( 'env_id' ) );

export default isJetpackCloud;
