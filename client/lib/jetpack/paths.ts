/**
 * Internal dependencies
 */
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'lib/url';
import { isEnabled } from 'config';

const backupBasePath = () => '/backup';
export const backupPath = ( siteSlug?: string, query = {} ) => {
	const path = siteSlug ? `${ backupBasePath() }/${ siteSlug }` : backupBasePath();
	return addQueryArgs( query, path );
};

const scanBasePath = () => '/scan';
export const scanPath = ( siteSlug?: string ) =>
	siteSlug ? `${ scanBasePath() }/${ siteSlug }` : scanBasePath();

const calypsoBasePath = () =>
	isEnabled( 'jetpack/features-section' ) ? '/settings/jetpack' : '/settings/security';
const settingsBasePath = () => ( isJetpackCloud() ? '/settings' : calypsoBasePath() );
export const settingsPath = ( siteSlug?: string ) =>
	siteSlug ? `${ settingsBasePath() }/${ siteSlug }` : settingsBasePath();
