import { SITE_COMPUTED_FIELDS, SITE_REQUEST_FIELDS, SITE_REQUEST_OPTIONS } from './use-sites';
import type { SiteDetails, SiteDetailsOptions } from '@automattic/data-stores';

export type SiteExcerptNetworkData = Pick<
	SiteDetails,
	( typeof SITE_REQUEST_FIELDS )[ number ]
> & {
	options?: Pick< SiteDetailsOptions, ( typeof SITE_REQUEST_OPTIONS )[ number ] >;
};

export type SiteExcerptData = Pick<
	SiteDetails,
	( typeof SITE_REQUEST_FIELDS )[ number ] | ( typeof SITE_COMPUTED_FIELDS )[ number ]
> & {
	title: string;
	options?: Pick< SiteDetailsOptions, ( typeof SITE_REQUEST_OPTIONS )[ number ] >;
};
