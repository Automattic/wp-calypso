import { css } from '@emotion/css';
import { ReactNode } from 'react';

const container = css( {
	display: 'flex',
	width: '100%',
	flexDirection: 'column',
	minWidth: 0,
	position: 'relative',
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
	leadingAction: ReactNode;
	primary: ReactNode;
	secondary: ReactNode;
}

export const SitesGridTile = ( {
	leading,
	leadingAction = null,
	primary,
	secondary,
}: SitesGridTileProps ) => {
	return (
		<div className={ container }>
			{ leading }
			{ leadingAction }
			<div>
				<div className={ primaryContainer }>{ primary }</div>
				{ secondary }
			</div>
		</div>
	);
};
