/**
 * Internal dependencies
 */
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';

const settingsBasePath = () => ( isJetpackCloud() ? '/settings' : '/settings/security' );

export const settingsPath = ( siteName: string ) =>
	siteName ? `${ settingsBasePath() }/${ siteName }` : settingsBasePath();
