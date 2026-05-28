import { decodeEntities } from '@wordpress/html-entities';
import type { ReadSiteResponse } from './types';

const withoutHttp = ( url: string ): string => url.replace( /^https?:\/\//, '' );

/**
 * Normalize a `/read/sites/{siteId}` payload into the shape Reader UI consumers
 * expect: derives `domain`/`slug`/`title`/`wpcom_url`, decodes `description`
 * entities, and strips `meta` and `subscription` (the latter is consumed
 * separately by the cross-slice sync via the raw cache value).
 */
export const adaptReadSite = ( site: ReadSiteResponse ): ReadSiteResponse => {
	const {
		meta: _meta,
		subscription: _subscription,
		...rest
	} = site as ReadSiteResponse & {
		meta?: unknown;
	};
	const adapted: ReadSiteResponse = { ...rest };

	if ( adapted.URL ) {
		adapted.domain = withoutHttp( adapted.URL );
		adapted.slug = adapted.domain.replace( /\//g, '::' );
	}

	const trimmedName = typeof adapted.name === 'string' ? adapted.name.trim() : '';
	adapted.title = trimmedName || adapted.title || adapted.domain;

	if ( adapted.description ) {
		adapted.description = decodeEntities( adapted.description );
	}

	if (
		adapted.options &&
		adapted.options.is_mapped_domain &&
		! adapted.is_jetpack &&
		adapted.options.unmapped_url
	) {
		adapted.wpcom_url = withoutHttp( adapted.options.unmapped_url );
	}

	if ( adapted.options && adapted.options.is_redirect && adapted.options.unmapped_url ) {
		adapted.slug = withoutHttp( adapted.options.unmapped_url );
		adapted.domain = adapted.slug;
	}

	return adapted;
};
