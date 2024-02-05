import {
	SITE_EXCERPT_COMPUTED_FIELDS,
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
} from './site-excerpt-constants';
import type { SiteDetails, SiteDetailsOptions } from '@automattic/data-stores';

export type SiteExcerptData = Pick<
	SiteDetails,
	| ( typeof SITE_EXCERPT_REQUEST_FIELDS )[ number ]
	| ( typeof SITE_EXCERPT_COMPUTED_FIELDS )[ number ]
> & {
	title: string;
	options?: Pick< SiteDetailsOptions, ( typeof SITE_EXCERPT_REQUEST_OPTIONS )[ number ] >;
};
