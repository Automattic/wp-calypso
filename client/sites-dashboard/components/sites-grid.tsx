import { css } from '@emotion/css';
import clsx from 'clsx';
import { MEDIA_QUERIES } from '../utils';
import { SitesGridItem } from './sites-grid-item';
import { SitesGridItemLoading } from './sites-grid-item-loading';
import type { SiteExcerptData } from '@automattic/sites';

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
	onSiteSelectBtnClick?: ( site: SiteExcerptData ) => void;
}

export const SitesGrid = ( props: SitesGridProps ) => {
	const { sites, isLoading, className, siteSelectorMode = false, onSiteSelectBtnClick } = props;
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
		<div className={ clsx( container, className ) }>
			{ isLoading
				? Array( N_LOADING_ROWS )
						.fill( null )
						.map( ( _, i ) => <SitesGridItemLoading key={ i } delayMS={ i * 150 } /> )
				: sites.map( ( site ) => (
						<SitesGridItem site={ site } key={ site.ID } { ...additionalProps } />
				  ) ) }
		</div>
	);
};
