import { css } from '@emotion/css';
import { ReactNode } from 'react';

const container = css( {
	display: 'flex',
	width: '100%',
	flexDirection: 'column',
	minWidth: 0,
	transition: 'all 0.3s ease-in-out',
	':hover': {
		transform: 'scale(1.07, 1.07)',
		':after': {
			//opacity: 1,
		},
	},
	':after': {
		content: '""',
		position: 'absolute',
		zIndex: -1,
		height: '100%',
		width: '100%',
		opacity: 0,
		boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
		transition: 'opacity 0.2s ease-in-out',
	},
} );

const primaryContainer = css( {
	display: 'flex',
	flex: 1,
	marginTop: '16px',
	marginBottom: '8px',
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
