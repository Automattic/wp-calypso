import { css } from '@emotion/css';
import { ReactNode } from 'react';

const container = css( {
	display: 'flex',
	width: '100%',
	flexDirection: 'column',
	minWidth: 0,
} );

const primaryContainer = css( {
	display: 'flex',
	flex: 1,
	marginBlockStart: '16px',
	marginBlockEnd: '8px',
	alignItems: 'center',
} );

interface SitesGridTileProps {
	leading: ReactNode;
	primary: ReactNode;
	secondary: ReactNode;
}

export const SitesGridTile = ( { leading, primary, secondary }: SitesGridTileProps ) => {
	return (
		<div className={ container }>
			{ leading }
			<div className={ primaryContainer }>{ primary }</div>
			{ secondary }
		</div>
	);
};
