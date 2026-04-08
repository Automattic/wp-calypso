import { JOINED_SITE_FIELDS, JOINED_SITE_OPTIONS } from '@automattic/api-core';
import debugFactory from 'debug';
import { type Request } from 'express';
import { createAuthenticatedRequest } from './authenticated-request';
import type { Site, User } from '@automattic/api-core';

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

/**
 * Bootstraps the site to render in the omnibar:
 * URL path slug → user.most_recent_blog → user.primary_blog.
 *
 * Accepts a user promise so it can run in parallel with user bootstrap —
 * the promise is only awaited if the URL path doesn't include a site slug.
 */
export default async function getBootstrappedSite(
	request: Request,
	userPromise: Promise< User >
): Promise< Site | null > {
	try {
		const siteSlugFromPath = getSiteSlugFromPath( request.path );
		if ( siteSlugFromPath ) {
			debug( 'Using site slug from URL path: %s', siteSlugFromPath );
			return await fetchSite( request, siteSlugFromPath );
		}

		const user = await userPromise;
		const siteId = user?.most_recent_blog || user.primary_blog;
		if ( ! siteId ) {
			debug( 'No site ID found in user.most_recent_blog or user.primary_blog' );
			return null;
		}

		debug( 'Using site ID from user: %d', siteId );
		return await fetchSite( request, siteId );
	} catch ( error ) {
		console.error( 'Site bootstrap failed:', ( error as Error ).message );
		return null;
	}
}
