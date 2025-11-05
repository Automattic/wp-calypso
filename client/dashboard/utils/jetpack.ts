import config from '@automattic/calypso-config';

const jetpackCloudEnvironments = [
	'jetpack-cloud-development',
	'jetpack-cloud-stage',
	'jetpack-cloud-horizon',
	'jetpack-cloud-production',
];

export const isJetpackCloud = (): boolean =>
	jetpackCloudEnvironments.includes( config( 'env_id' ) );

const settingsBasePath = () => ( isJetpackCloud() ? '/settings' : '/settings/jetpack' );

export const settingsPath = ( siteSlug: string | null, section?: string ): string =>
	`${ settingsBasePath() }${ section ? '/' + section : '' }${ siteSlug ? '/' + siteSlug : '' }`;
