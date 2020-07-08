/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';

const backupBasePath = () => '/backup';
export const backupPath = ( siteSlug?: string, query = {} ) => {
	const path = siteSlug ? `${ backupBasePath() }/${ siteSlug }` : backupBasePath();
	return addQueryArgs( query, path );
};

const scanBasePath = () => '/scan';
export const scanPath = ( siteSlug?: string ) =>
	siteSlug ? `${ scanBasePath() }/${ siteSlug }` : scanBasePath();

const settingsBasePath = () => ( isJetpackCloud() ? '/settings' : '/settings/jetpack' );
export const settingsPath = ( siteSlug?: string ) =>
	siteSlug ? `${ settingsBasePath() }/${ siteSlug }` : settingsBasePath();
