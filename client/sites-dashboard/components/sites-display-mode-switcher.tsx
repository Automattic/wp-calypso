import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { SitesRowsIcon } from './sites-rows-icon';
import { SitesTileIcon } from './sites-tile-icon';

const container = css( {
	marginLeft: 'auto',
	display: 'flex',
	gap: '10px',
} );

const SiteSwitcherIcon = styled.svg< { active: boolean } >(
	{
		padding: '5px',
		borderRadius: '4px',
	},
	( props ) => {
		if ( props.active ) {
			return {
				color: '#FFF',
				background: '#101517',
			};
		}

		return {
			color: '#50575E',
		};
	}
);

export const SitesDisplayModeSwitcher = () => {
	return (
		<div className={ container }>
			<SiteSwitcherIcon as={ SitesTileIcon } active={ false } />
			<SiteSwitcherIcon as={ SitesRowsIcon } active />
		</div>
	);
};
