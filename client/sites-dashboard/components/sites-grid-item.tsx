import { css } from '@emotion/css';
import { useI18n } from '@wordpress/react-i18n';
import { AnchorHTMLAttributes, memo } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteStatus } from '../hooks/use-site-status';
import { displaySiteUrl, getDashboardUrl } from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import { SitesGridTile } from './sites-grid-tile';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
import SitesP2Badge from './sites-p2-badge';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteName } from './sites-site-name';
import { SiteUrl, Truncated } from './sites-site-url';

const badges = css( { display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' } );

export const siteThumbnail = css( {
	aspectRatio: '16 / 9',
	width: '100%',
	height: 'auto',
} );

const ellipsis = css( {
	'.button.ellipsis-menu__toggle': {
		padding: 0,
	},

	'.gridicon.ellipsis-menu__toggle-icon': {
		width: '24px',
		height: '16px',
		top: '4px',
	},
} );

interface SitesGridItemProps {
	site: SiteExcerptData;
}

export const SitesGridItem = memo( ( { site }: SitesGridItemProps ) => {
	const { __ } = useI18n();

	const isP2Site = site.options?.is_wpforteams_site;
	const { status, translatedStatus } = useSiteStatus( site );

	const siteDashboardUrlProps: AnchorHTMLAttributes< HTMLAnchorElement > = {
		href: getDashboardUrl( site.slug ),
		title: __( 'Visit Dashboard' ),
	};

	return (
		<SitesGridTile
			leading={
				<a { ...siteDashboardUrlProps }>
					<SiteItemThumbnail className={ siteThumbnail } site={ site } size={ 'medium' } />
				</a>
			}
			primary={
				<>
					<SiteName fontSize={ 16 } { ...siteDashboardUrlProps }>
						{ site.name }
					</SiteName>

					<div className={ badges }>
						{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
						{ status !== 'public' && (
							<SitesLaunchStatusBadge>{ translatedStatus }</SitesLaunchStatusBadge>
						) }
						<SitesEllipsisMenu className={ ellipsis } site={ site } />
					</div>
				</>
			}
			secondary={
				<SiteUrl href={ site.URL } title={ site.URL } className={ css( { lineHeight: 1 } ) }>
					<Truncated>{ displaySiteUrl( site.URL ) }</Truncated>
				</SiteUrl>
			}
		/>
	);
} );
