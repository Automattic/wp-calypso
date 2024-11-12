import { Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import { displaySiteUrl } from 'calypso/sites-dashboard/utils';
import type { SiteExcerptData } from '@automattic/sites';

export default function SiteUrl( { site }: { site: SiteExcerptData } ) {
	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	if ( site.is_deleted ) {
		return <Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>;
	}

	return (
		<div className="sites-dataviews__site-urls">
			<Truncated className="sites-dataviews__site-url">{ displaySiteUrl( siteUrl ) }</Truncated>
		</div>
	);
}
