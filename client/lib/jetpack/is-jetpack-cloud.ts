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

export const isJetpackCloudProd = (): boolean => 'jetpack-cloud-production' === config( 'env_id' );

const isJetpackCloud = (): boolean => jetpackCloudEnvironments.includes( config( 'env_id' ) );

export default isJetpackCloud;
