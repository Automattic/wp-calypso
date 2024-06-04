import { css } from '@emotion/css';
import clsx from 'clsx';
import { MEDIA_QUERIES } from 'calypso/sites-dashboard/utils';
import sampleSiteData from '../../docs/sample-site-data';
import { SitesGridItem } from '../../sites-grid-item';

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

const className = css( {
	marginBlockStart: 0,
	marginInline: 0,
	marginBlockEnd: '1.5em',
} );

const itemClassName = css( {
	minWidth: 0,
} );

const SitesGridItemExample = () => {
	return (
		<div className={ clsx( container, className ) }>
			{ sampleSiteData.map( ( site ) => (
				<div className={ itemClassName } key={ site.ID }>
					<SitesGridItem site={ site } key={ site.ID } />
				</div>
			) ) }
		</div>
	);
};

SitesGridItemExample.displayName = 'SitesGridItem';

export default SitesGridItemExample;
