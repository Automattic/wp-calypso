import { Truncated } from 'calypso/sites-dashboard/components/sites-site-url';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import type { SiteExcerptData } from '@automattic/sites';

export default function SiteUrl( { site }: { site: SiteExcerptData } ) {
	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( site.ID );

	if ( site.is_deleted ) {
		return null;
	}

	return (
		<a className="sites-dataviews__site-wp-admin-url" href={ adminUrl }>
			<Truncated>{ adminLabel }</Truncated>
		</a>
	);
}
