/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

const backupBasePath = () => '/backup';
export const backupPath = ( siteSlug?: string, query = {} ) => {
	const path = siteSlug ? `${ backupBasePath() }/${ siteSlug }` : backupBasePath();
	return addQueryArgs( query, path );
};

const scanBasePath = () => '/scan';
export const scanPath = ( siteSlug?: string ) =>
	siteSlug ? `${ scanBasePath() }/${ siteSlug }` : scanBasePath();

const settingsBasePath = () => ( isJetpackCloud() ? '/settings' : '/settings/jetpack' );

export const settingsPath = ( siteSlug?: string, section?: string ) =>
	`${ settingsBasePath() }${ section ? '/' + section : '' }${ siteSlug ? '/' + siteSlug : '' }`;

export const settingsHostSelectionPath = ( siteSlug?: string ) =>
	settingsPath( siteSlug, 'host-selection' );

export const settingsCredentialsPath = ( siteSlug: string, host: string ) =>
	settingsPath( siteSlug, `credentials/${ host }` );
