import { css } from '@emotion/css';
import classnames from 'classnames';
import { MEDIA_QUERIES } from '../utils';
import { LinkInBioBanner } from './link-in-bio-banner/link-in-bio-banner';
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
	siteSelectorMode?: boolean;
	showLinkInBioBanner?: boolean;
	onSiteSelectBtnClick?: ( site: SiteExcerptData ) => void;
}

export const SitesGrid = ( props: SitesGridProps ) => {
	const {
		sites,
		isLoading,
		className,
		showLinkInBioBanner = true,
		siteSelectorMode = false,
		onSiteSelectBtnClick,
	} = props;
	const additionalProps = siteSelectorMode
		? {
				showLaunchNag: false,
				showBadgeSection: false,
				showThumbnailLink: false,
				showSiteRenewLink: false,
				onSiteSelectBtnClick,
		  }
		: {};

	return (
		<div className={ classnames( container, className ) }>
			{ isLoading
				? Array( N_LOADING_ROWS )
						.fill( null )
						.map( ( _, i ) => <SitesGridItemLoading key={ i } delayMS={ i * 150 } /> )
				: sites.map( ( site ) => (
						<SitesGridItem site={ site } key={ site.ID } { ...additionalProps } />
				  ) ) }
			{ showLinkInBioBanner && <LinkInBioBanner displayMode="grid" /> }
		</div>
	);
};
