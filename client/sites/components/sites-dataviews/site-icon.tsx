import { translate } from 'i18n-calypso';
import SiteFavicon from 'calypso/a8c-for-agencies/components/items-dashboard/site-favicon';
import { ThumbnailLink } from 'calypso/sites-dashboard/components/thumbnail-link';
import { getMigrationStatus } from 'calypso/sites-dashboard/utils';
import type { SiteExcerptData } from '@automattic/sites';

type Props = {
	site: SiteExcerptData;
	openSitePreviewPane?: ( site: SiteExcerptData ) => void;
};

export default function SiteIcon( { site }: Props ) {
	const isMigrationPending = getMigrationStatus( site ) === 'pending';
	const siteTitle = isMigrationPending ? translate( 'Incoming Migration' ) : site.title;

	return (
		<ThumbnailLink title={ siteTitle }>
			<SiteFavicon
				className="sites-site-favicon"
				blogId={ site.ID }
				fallback={ isMigrationPending ? 'migration' : 'first-grapheme' }
				size={ 52 }
			/>
		</ThumbnailLink>
	);
}
