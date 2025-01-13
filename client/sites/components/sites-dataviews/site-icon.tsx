import { translate } from 'i18n-calypso';
import * as React from 'react';
import SiteFavicon from 'calypso/blocks/site-favicon';
import { navigate } from 'calypso/lib/navigate';
import { isP2Theme } from 'calypso/lib/site/utils';
import { ThumbnailLink } from 'calypso/sites-dashboard/components/thumbnail-link';
import {
	isNotAtomicJetpack,
	getMigrationStatus,
	isDisconnectedJetpackAndNotAtomic,
} from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import type { SiteExcerptData } from '@automattic/sites';

export default function SiteIcon( {
	site,
	openSitePreviewPane,
	viewType,
	disableClick,
}: {
	site: SiteExcerptData;
	openSitePreviewPane?: (
		site: SiteExcerptData,
		source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher'
	) => void;
	viewType: 'list' | 'table' | 'grid' | 'breadcrumb';
	disableClick?: boolean;
} ) {
	const { adminUrl } = useSiteAdminInterfaceData( site.ID );
	const isP2Site = site.options?.theme_slug && isP2Theme( site.options?.theme_slug );
	const isAdmin = useSelector( ( state ) => canCurrentUser( state, site.ID, 'manage_options' ) );

	const onClick = ( event: React.MouseEvent ) => {
		event.preventDefault();

		if ( site.is_deleted ) {
			return;
		}

		if (
			isAdmin &&
			! isP2Site &&
			! isNotAtomicJetpack( site ) &&
			! isDisconnectedJetpackAndNotAtomic( site )
		) {
			openSitePreviewPane && openSitePreviewPane( site, 'site_field' );
		} else {
			navigate( adminUrl );
		}
	};

	const isMigrationPending = getMigrationStatus( site ) === 'pending';
	const siteTitle = isMigrationPending ? translate( 'Incoming Migration' ) : site.title;

	const size = React.useMemo( () => {
		switch ( viewType ) {
			case 'list':
				return 52;
			case 'breadcrumb':
				return 24;
			default:
				return 32;
		}
	}, [ viewType ] );

	return (
		<ThumbnailLink
			title={ siteTitle }
			onClick={ disableClick ? undefined : onClick }
			className="sites-dataviews__site-icon"
		>
			<SiteFavicon
				className="sites-site-favicon"
				blogId={ site.ID }
				fallback={ isMigrationPending ? 'migration' : 'first-grapheme' }
				size={ size }
			/>
		</ThumbnailLink>
	);
}
