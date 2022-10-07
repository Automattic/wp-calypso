import { css } from '@emotion/css';
import classnames from 'classnames';
import { LinkInBioTiledBanner } from 'calypso/sites-dashboard/components/link-in-bio-banner/link-in-bio-tile-banner';
import { LinkInBioTileStretchBanner } from 'calypso/sites-dashboard/components/link-in-bio-banner/link-in-bio-tile-stretch-banner';
import { useLinkInBioBanner } from 'calypso/sites-dashboard/components/link-in-bio-banner/use-link-in-bio-banner';
import { MEDIA_QUERIES } from '../utils';
import { SitesGridItem } from './sites-grid-item';
import { SitesGridItemLoading } from './sites-grid-item-loading';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const N_LOADING_ROWS = 3;

const container = css( {
	display: 'grid',
	gap: '32px',

	gridTemplateColumns: '1fr',

	[ MEDIA_QUERIES.mediumOrLarger ]: {
		gridTemplateColumns: 'repeat(2, 1fr)',
	},

	[ MEDIA_QUERIES.large ]: {
		gridTemplateColumns: 'repeat(3, 1fr)',
	},
} );

interface SitesGridProps {
	className?: string;
	isLoading: boolean;
	sites: SiteExcerptData[];
}

export const SitesGrid = ( { sites, isLoading, className }: SitesGridProps ) => {
	// TODO just for testing the PR - will be removed.
	const params = new URLSearchParams( window.location.search );
	if ( params.get( 'sitecount' ) ) {
		sites = sites.slice( 0, Number( params.get( 'sitecount' ) ) );
	}
	const { showBanner } = useLinkInBioBanner();
	let banner = null;
	if ( showBanner ) {
		if ( sites.length === 1 ) {
			banner = <LinkInBioTileStretchBanner />;
		} else if ( sites.length === 2 ) {
			banner = <LinkInBioTiledBanner />;
		}
	}
	return (
		<div className={ classnames( container, className ) }>
			{ isLoading
				? Array( N_LOADING_ROWS )
						.fill( null )
						.map( ( _, i ) => <SitesGridItemLoading key={ i } delayMS={ i * 150 } /> )
				: sites.map( ( site ) => <SitesGridItem site={ site } key={ site.ID } /> ) }
			{ banner }
		</div>
	);
};
