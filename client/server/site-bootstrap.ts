import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from '@automattic/api-core';
import debugFactory from 'debug';
import { type Request } from 'express';
import { createAuthenticatedRequest } from './bootstrap-auth';
import type { Site } from '@automattic/api-core';

const debug = debugFactory( 'calypso:bootstrap' );

const API_BASE = 'https://public-api.wordpress.com/rest/v1.1';

function getSiteSlugFromPath( path: string ): string | null {
	const match = path.match( /^\/sites\/([^/]+)/ );
	return match ? match[ 1 ] : null;
}

async function fetchSite( request: Request, siteIdOrSlug: string | number ): Promise< Site > {
	const query = new URLSearchParams( { fields: JOINED_SITE_FIELDS, options: JOINED_SITE_OPTIONS } );
	const url = `${ API_BASE }/sites/${ encodeURIComponent( siteIdOrSlug ) }?${ query }`;

	debug( 'Fetching site %o', url );
	const req = createAuthenticatedRequest( request, url );
	const res = await req;
	debug( '%o -> %o status code', url, res.status );
	return res.body;
}

async function fetchRecentSiteId( request: Request ): Promise< number | null > {
	const url = `${ API_BASE }/me/preferences`;

	debug( 'Fetching preferences %o', url );
	const req = createAuthenticatedRequest( request, url );
	debug( 'Starting request: ', req );
	const res = await req;
	debug( '%o -> %o status code', url, res.status );

	const recentSites = res.body?.calypso_preferences?.recentSites;
	return recentSites?.[ 0 ] || null;
}

/**
 * Bootstraps the user's most recent site (or the site from the URL path).
 * Accepts a user promise so it can run in parallel with user bootstrap —
 * the promise is only awaited as a last-resort fallback for primary_blog.
 */
export default async function getBootstrappedSite(
	request: Request,
	userPromise: Promise< { primary_blog?: number } >
): Promise< Site | null > {
	try {
		// Prefer site slug from URL path over user preferences.
		const siteSlugFromPath = getSiteSlugFromPath( request.path );
		if ( siteSlugFromPath ) {
			debug( 'Using site slug from URL path: %s', siteSlugFromPath );
			return await fetchSite( request, siteSlugFromPath );
		}

		// Fall back to most recent site from preferences, then primary_blog.
		const recentSiteId = await fetchRecentSiteId( request );
		if ( recentSiteId ) {
			debug( 'Using site ID from preferences: %d', recentSiteId );
			return await fetchSite( request, recentSiteId );
		}

		const primaryBlog = ( await userPromise )?.primary_blog;
		if ( ! primaryBlog ) {
			debug( 'No site ID found in preferences or user.primary_blog' );
			return null;
		}

		debug( 'Using site ID from primary_blog: %d', primaryBlog );
		return await fetchSite( request, primaryBlog );
	} catch ( error ) {
		debug( 'Site bootstrap failed: %s', ( error as Error ).message );
		return null;
	}
}
