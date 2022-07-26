import {
	SITE_EXCERPT_COMPUTED_FIELDS,
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
} from './site-excerpt-constants';
import type { SiteData, SiteDataOptions } from 'calypso/state/ui/selectors/site-data';

export type SiteExcerptNetworkData = Pick<
	SiteData,
	typeof SITE_EXCERPT_REQUEST_FIELDS[ number ]
> & {
	options?: Pick< SiteDataOptions, typeof SITE_EXCERPT_REQUEST_OPTIONS[ number ] >;
};

export type SiteExcerptData = Pick<
	SiteData,
	typeof SITE_EXCERPT_REQUEST_FIELDS[ number ] | typeof SITE_EXCERPT_COMPUTED_FIELDS[ number ]
> & {
	options?: Pick< SiteDataOptions, typeof SITE_EXCERPT_REQUEST_OPTIONS[ number ] >;
};
