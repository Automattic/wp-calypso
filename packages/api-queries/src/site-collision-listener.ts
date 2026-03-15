import { SITE_FIELDS, SITE_OPTIONS } from '@automattic/api-core';
import { withoutHttp } from './utils';
import type { Site, FetchPaginatedSitesResponse } from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';

function siteBySlugKey( slug: string ) {
	return [ 'site-by-slug', slug, SITE_FIELDS, SITE_OPTIONS ] as const;
}

function siteByIdKey( id: number ) {
	return [ 'site-by-id', id, SITE_FIELDS, SITE_OPTIONS ] as const;
}

function urlToSiteSlug( url: string ): string {
	return withoutHttp( url ).replace( /\//g, '::' );
}

function isSite( value: unknown ): value is Site {
	return (
		!! value &&
		typeof value === 'object' &&
		'jetpack' in value &&
		typeof value.jetpack === 'boolean' &&
		'URL' in value &&
		typeof value.URL === 'string'
	);
}

/**
 * If a non-Jetpack site's URL collides with a Jetpack site URL, return a copy
 * with `slug` corrected to use `unmapped_url`. Returns the same reference when
 * no fix is needed, which doubles as the "already fixed" signal for the listener.
 */
function fixSiteSlug( site: Site, jetpackUrls: Set< string > ): Site {
	if ( site.jetpack ) {
		return site;
	}

	const siteUrl = withoutHttp( site.URL );
	if ( ! jetpackUrls.has( siteUrl ) ) {
		return site;
	}

	const unmappedUrl = site.options?.unmapped_url;
	if ( ! unmappedUrl ) {
		return site;
	}

	const correctedSlug = urlToSiteSlug( unmappedUrl );
	if ( correctedSlug === site.slug ) {
		return site;
	}

	return { ...site, slug: correctedSlug };
}

function fixSitesArray( sites: Site[], jetpackUrls: Set< string > ): Site[] | null {
	let changed = false;
	const result = sites.map( ( site ) => {
		const fixed = fixSiteSlug( site, jetpackUrls );
		if ( fixed !== site ) {
			changed = true;
		}
		return fixed;
	} );
	return changed ? result : null;
}

/**
 * Subscribe to query cache events and rewrite site slugs that collide with
 * Jetpack-connected sites. Returns an unsubscribe function.
 *
 * Accepts `queryClient` as a parameter for testability and to avoid circular
 * module dependencies with query-client.ts.
 */
export function startSiteCollisionListener( qc: QueryClient ): () => void {
	let processing = false;

	function getJetpackUrls(): Set< string > | undefined {
		const dataInCache = qc.getQueryData< string[] >( [ 'jetpack-site-urls' ] );
		if ( dataInCache ) {
			return new Set( dataInCache );
		}

		// Scan cached Site objects for Jetpack URLs to use as placeholder data
		// while the authoritative fetch runs in the background.
		const urls = qc
			.getQueriesData( {
				predicate: ( query ) =>
					query.state.status === 'success' &&
					( query.queryKey[ 0 ] === 'sites' ||
						query.queryKey[ 0 ] === 'site-by-id' ||
						query.queryKey[ 0 ] === 'site-by-slug' ),
			} )
			.flatMap( ( [ , data ] ) => {
				if ( ! data ) {
					return [];
				}

				let items: unknown[] = [];
				if ( typeof data === 'object' && 'sites' in data && Array.isArray( data.sites ) ) {
					items = data.sites;
				} else {
					items = Array.isArray( data ) ? data : [ data ];
				}
				return items.flatMap( ( item ) =>
					isSite( item ) && item.jetpack ? [ withoutHttp( item.URL ) ] : []
				);
			} );

		return urls.length > 0 ? new Set( urls ) : undefined;
	}

	function growJetpackUrls( sites: Site[], jetpackUrls: Set< string > ) {
		const newUrls = sites
			.filter( ( site ) => site.jetpack )
			.map( ( site ) => withoutHttp( site.URL ) )
			.filter( ( url ) => ! jetpackUrls.has( url ) );

		if ( newUrls.length > 0 ) {
			qc.setQueryData( [ 'jetpack-site-urls' ], [ ...jetpackUrls, ...newUrls ] );
		}
	}

	function fixAndSetSite( site: Site, jetpackUrls: Set< string > ) {
		const fixed = fixSiteSlug( site, jetpackUrls );
		if ( fixed === site ) {
			return;
		}

		// Intentional: writes the corrected site back to the ORIGINAL cache key.
		// This means e.g. ['site-by-slug', 'example.com'] will hold a site whose
		// slug is 'example.wordpress.com'. This should prevent existing components
		// from breaking, but hopefully any subsequent navigations will use the new
		// slug and therefore the correct cache key.
		qc.setQueryData( siteBySlugKey( site.slug ), fixed );

		qc.setQueryData( siteByIdKey( site.ID ), fixed );
		if ( fixed.slug !== site.slug ) {
			qc.setQueryData( siteBySlugKey( fixed.slug ), fixed );
		}
	}

	function scanAndFixAllCachedSites( jetpackUrls: Set< string > ) {
		// Fix individual site entries.
		const siteQueries = qc.getQueriesData< Site >( {
			predicate: ( query ) => {
				const prefix = query.queryKey[ 0 ];
				return prefix === 'site-by-slug' || prefix === 'site-by-id';
			},
		} );
		for ( const [ key, site ] of siteQueries ) {
			if ( site ) {
				const fixed = fixSiteSlug( site, jetpackUrls );
				if ( fixed !== site ) {
					qc.setQueryData( key, fixed );
					if ( fixed.slug !== site.slug ) {
						qc.setQueryData( siteBySlugKey( fixed.slug ), fixed );
					}
				}
			}
		}

		// Fix sites list entries.
		const sitesListQueries = qc.getQueriesData< Site[] | FetchPaginatedSitesResponse >( {
			predicate: ( query ) => query.queryKey[ 0 ] === 'sites',
		} );
		for ( const [ key, data ] of sitesListQueries ) {
			if ( ! data ) {
				continue;
			}
			if ( Array.isArray( data ) ) {
				const fixed = fixSitesArray( data, jetpackUrls );
				if ( fixed ) {
					qc.setQueryData( key, fixed );
				}
			} else if ( 'sites' in data && Array.isArray( data.sites ) ) {
				const fixed = fixSitesArray( data.sites, jetpackUrls );
				if ( fixed ) {
					qc.setQueryData( key, { ...data, sites: fixed } );
				}
			}
		}
	}

	return qc.getQueryCache().subscribe( ( event ) => {
		if ( event.type !== 'updated' || event.action.type !== 'success' ) {
			return;
		}

		const prefix = event.query.queryKey[ 0 ];

		// Skip unrelated queries before doing any work.
		if (
			prefix !== 'jetpack-site-urls' &&
			prefix !== 'site-by-slug' &&
			prefix !== 'site-by-id' &&
			prefix !== 'sites'
		) {
			return;
		}

		// Guard against re-entrant calls from our own setQueryData writes.
		if ( processing ) {
			return;
		}
		processing = true;

		try {
			handleEvent( event.query );
		} finally {
			processing = false;
		}
	} );

	function handleEvent( query: { queryKey: readonly unknown[]; state: { data: unknown } } ) {
		const queryKey = query.queryKey;
		const prefix = queryKey[ 0 ];

		const jetpackUrls = getJetpackUrls();
		if ( ! jetpackUrls ) {
			return;
		}

		// When jetpack URLs arrive, retroactively fix everything already cached.
		if ( prefix === 'jetpack-site-urls' ) {
			scanAndFixAllCachedSites( jetpackUrls );
			return;
		}

		// Single site queries.
		if ( prefix === 'site-by-slug' || prefix === 'site-by-id' ) {
			const site = query.state.data as Site | undefined;
			if ( site ) {
				growJetpackUrls( [ site ], jetpackUrls );
				fixAndSetSite( site, jetpackUrls );
			}
			return;
		}

		// Sites list queries (both array and paginated).
		if ( prefix === 'sites' ) {
			const data = query.state.data as Site[] | FetchPaginatedSitesResponse | undefined;
			if ( ! data ) {
				return;
			}
			let sites: Site[] | null = null;
			if ( Array.isArray( data ) ) {
				sites = data;
			} else if ( 'sites' in data ) {
				sites = data.sites;
			}
			if ( ! sites ) {
				return;
			}
			growJetpackUrls( sites, jetpackUrls );
			if ( Array.isArray( data ) ) {
				const fixed = fixSitesArray( data, jetpackUrls );
				if ( fixed ) {
					qc.setQueryData( queryKey, fixed );
				}
			} else if ( 'sites' in data && Array.isArray( data.sites ) ) {
				const fixed = fixSitesArray( data.sites, jetpackUrls );
				if ( fixed ) {
					qc.setQueryData( queryKey, { ...data, sites: fixed } );
				}
			}
		}
	}
}
