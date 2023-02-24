import { css } from '@emotion/css';
import { ReactNode, forwardRef } from 'react';

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
	primary: ReactNode;
	secondary: ReactNode;
}

export const SitesGridTile = forwardRef< HTMLDivElement, SitesGridTileProps >(
	( { leading, primary, secondary }, ref ) => {
		return (
			<div ref={ ref } className={ container }>
				{ leading }
				<div>
					<div className={ primaryContainer }>{ primary }</div>
					{ secondary }
				</div>
			</div>
		);
	}
);
