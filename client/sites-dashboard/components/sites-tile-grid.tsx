import { css } from '@emotion/css';
import { SitesTileItem } from './sites-tile-item';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const container = css( {
	display: 'grid',
	gap: '32px',
	gridTemplateColumns: 'repeat(3, 1fr)',
} );

interface SitesTileGridProps {
	sites: SiteExcerptData[];
}

export const SitesTileGrid = ( { sites }: SitesTileGridProps ) => {
	return (
		<div className={ container }>
			{ sites.map( ( site ) => (
				<SitesTileItem site={ site } key={ site.ID } />
			) ) }
		</div>
	);
};
