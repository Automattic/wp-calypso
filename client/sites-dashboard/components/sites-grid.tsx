import { css } from '@emotion/css';
import classnames from 'classnames';
import { SitesGridItem } from './sites-grid-item';
import { SitesGridItemLoading } from './sites-grid-item-loading';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const N_LOADING_ROWS = 3;

const container = css( {
	display: 'grid',
	gap: '32px',

	gridTemplateColumns: '1fr',

	'@media screen and (min-width: 660px)': {
		gridTemplateColumns: 'repeat(2, 1fr)',
	},

	'@media screen and (min-width: 960px)': {
		gridTemplateColumns: 'repeat(3, 1fr)',
	},
} );

interface SitesGridProps {
	className?: string;
	isLoading: boolean;
	sites: SiteExcerptData[];
	showVisibilityIndicator: boolean;
}

export const SitesGrid = ( {
	sites,
	isLoading,
	className,
	showVisibilityIndicator,
}: SitesGridProps ) => {
	return (
		<div className={ classnames( container, className ) }>
			{ isLoading
				? Array( N_LOADING_ROWS )
						.fill( null )
						.map( ( _, i ) => <SitesGridItemLoading key={ i } delayMS={ i * 150 } /> )
				: sites.map( ( site ) => (
						<SitesGridItem
							site={ site }
							key={ site.ID }
							showVisibilityIndicator={ showVisibilityIndicator }
						/>
				  ) ) }
		</div>
	);
};
