import { css } from '@emotion/css';
import { useI18n } from '@wordpress/react-i18n';
import { AnchorHTMLAttributes } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteStatus } from '../hooks/use-site-status';
import { displaySiteUrl, getDashboardUrl } from '../utils';
import { SitesEllipsisMenu } from './sites-ellipsis-menu';
import SitesLaunchStatusBadge from './sites-launch-status-badge';
import SitesP2Badge from './sites-p2-badge';
import { SiteName } from './sites-site-name';
import { SiteUrl } from './sites-site-url';

const container = css( {
	display: 'flex',
	width: '100%',
	flexDirection: 'column',
	minWidth: 0,
} );

const siteTitle = css( {
	display: 'flex',
	flex: 1,
	marginTop: '16px',
	marginBottom: '8px',
	alignItems: 'center',
} );

const badges = css( { display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' } );

const siteImage = css( {
	aspectRatio: '1 / 1',
	width: '100%',
	background: '#F6F7F7',
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

interface SitesTileItemProps {
	site: SiteExcerptData;
}

export const SitesTileItem = ( { site }: SitesTileItemProps ) => {
	const { __ } = useI18n();

	const isP2Site = site.options?.is_wpforteams_site;
	const { status, translatedStatus } = useSiteStatus( site );

	const siteDashboardUrlProps: AnchorHTMLAttributes< HTMLAnchorElement > = {
		href: getDashboardUrl( site.slug ),
		title: __( 'Visit Dashboard' ),
	};

	return (
		<div className={ container }>
			<a { ...siteDashboardUrlProps }>
				<div className={ siteImage } />
			</a>
			<div className={ siteTitle }>
				<SiteName fontSize={ 16 } { ...siteDashboardUrlProps }>
					{ site.name ? site.name : __( '(No Site Title)' ) }
				</SiteName>

				<div className={ badges }>
					{ isP2Site && <SitesP2Badge>P2</SitesP2Badge> }
					{ status !== 'public' && (
						<SitesLaunchStatusBadge>{ translatedStatus }</SitesLaunchStatusBadge>
					) }
					<SitesEllipsisMenu className={ ellipsis } site={ site } />
				</div>
			</div>
			<SiteUrl href={ site.URL } target="_blank" rel="noreferrer" title={ site.URL }>
				{ displaySiteUrl( site.URL ) }
			</SiteUrl>
		</div>
	);
};
