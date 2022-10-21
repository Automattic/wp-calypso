import { useSiteLaunchStatusLabel, getSiteLaunchStatus } from '@automattic/sites';
import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { AnchorHTMLAttributes, memo } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { displaySiteUrl, getDashboardUrl } from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import { SitesGridActionRenew } from './sites-grid-action-renew';
import { SitesGridTile } from './sites-grid-tile';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
import SitesP2Badge from './sites-p2-badge';
import { SiteItemThumbnail } from './sites-site-item-thumbnail';
import { SiteLaunchNag } from './sites-site-launch-nag';
import { SiteName } from './sites-site-name';
import { SiteUrl, Truncated } from './sites-site-url';
import { ThumbnailLink } from './thumbnail-link';

const SIZES_ATTR = [
	'(min-width: 1345px) calc((1280px - 64px) / 3)',
	'(min-width: 960px) calc((100vw - 128px) / 3)',
	'(min-width: 780px) calc((100vw - 96px) / 2)',
	'(min-width: 660px) calc((100vw - 64px) / 2)',
	'calc(100vw - 32px)',
].join( ', ' );

const ASPECT_RATIO = 16 / 11;

const THUMBNAIL_DIMENSION = {
	width: 401,
	height: 401 / ASPECT_RATIO,
};

const badges = css( {
	display: 'flex',
	gap: '8px',
	alignItems: 'center',
	marginInlineStart: 'auto',
} );

export const siteThumbnail = css( {
	aspectRatio: '16 / 11',
	width: '100%',
	height: 'auto',
} );

const SitesGridItemSecondary = styled.div( {
	display: 'flex',
	gap: '32px',
	justifyContent: 'space-between',
} );

const ellipsis = css( {
	'.button.ellipsis-menu__toggle': {
		padding: 0,
	},

	'.gridicon.ellipsis-menu__toggle-icon': {
		width: '24px',
		height: '16px',
		insetBlockStart: '4px',
	},
} );

interface SitesGridItemProps {
	site: SiteExcerptData;
}

export const SitesGridItem = memo( ( { site }: SitesGridItemProps ) => {
	const { __ } = useI18n();

	const isP2Site = site.options?.is_wpforteams_site;
	const translatedStatus = useSiteLaunchStatusLabel( site );

	const siteDashboardUrlProps: AnchorHTMLAttributes< HTMLAnchorElement > = {
		href: getDashboardUrl( site.slug ),
		title: __( 'Visit Dashboard' ),
	};

	let siteUrl = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		siteUrl = site.options?.unmapped_url;
	}

	return (
		<SitesGridTile
			leading={
				<ThumbnailLink { ...siteDashboardUrlProps }>
					<SiteItemThumbnail
						displayMode="tile"
						className={ siteThumbnail }
						site={ site }
						width={ THUMBNAIL_DIMENSION.width }
						height={ THUMBNAIL_DIMENSION.height }
						sizesAttr={ SIZES_ATTR }
					/>
				</ThumbnailLink>
			}
			leadingAction={ site.plan?.expired && <SitesGridActionRenew site={ site } /> }
			primary={
				<>
					<SiteName fontSize={ 16 } { ...siteDashboardUrlProps }>
						{ site.title }
					</SiteName>

					<div className={ badges }>
						{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
						{ getSiteLaunchStatus( site ) !== 'public' && (
							<SitesLaunchStatusBadge>{ translatedStatus }</SitesLaunchStatusBadge>
						) }
						<SitesEllipsisMenu className={ ellipsis } site={ site } />
					</div>
				</>
			}
			secondary={
				<SitesGridItemSecondary>
					<SiteUrl href={ siteUrl } title={ siteUrl }>
						<Truncated>{ displaySiteUrl( siteUrl ) }</Truncated>
					</SiteUrl>
					<SiteLaunchNag site={ site } />
				</SitesGridItemSecondary>
			}
		/>
	);
} );
