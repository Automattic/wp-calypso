import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { addQueryArgs } from 'calypso/lib/url';

const backupBasePath = () => '/backup';
export const backupPath = ( siteSlug?: string, query = {} ): string => {
	const path = siteSlug ? `${ backupBasePath() }/${ siteSlug }` : backupBasePath();
	return addQueryArgs( query, path );
};

const scanBasePath = () => '/scan';
export const scanPath = ( siteSlug?: string ): string =>
	siteSlug ? `${ scanBasePath() }/${ siteSlug }` : scanBasePath();

const settingsBasePath = () => ( isJetpackCloud() ? '/settings' : '/settings/jetpack' );

export const settingsPath = ( siteSlug: string | null, section?: string ): string =>
	`${ settingsBasePath() }${ section ? '/' + section : '' }${ siteSlug ? '/' + siteSlug : '' }`;

export const settingsHostSelectionPath = ( siteSlug: string | null ): string =>
	settingsPath( siteSlug, 'host-selection' );

export const settingsCredentialsPath = ( siteSlug: string, host: string ): string =>
	settingsPath( siteSlug, `credentials/${ host }` );

export const purchasesBasePath = () => '/purchases';
export const purchasesPath = ( siteSlug: string | null ): string =>
	siteSlug ? `${ purchasesBasePath() }/${ siteSlug }` : purchasesBasePath();

export const socialBasePath = () => '/jetpack-social';
export const socialPath = ( siteSlug?: string ): string =>
	siteSlug ? `${ socialBasePath() }/${ siteSlug }` : socialBasePath();
