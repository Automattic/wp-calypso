import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { ComponentProps } from 'react';
import { SitesRowsIcon } from './sites-rows-icon';
import { SitesTileIcon } from './sites-tile-icon';

const container = css( {
	marginLeft: 'auto',
	display: 'flex',
	gap: '10px',
} );

const SiteSwitcherButton = styled( Button )<
	ComponentProps< typeof Button > & { active: boolean }
>( { borderRadius: '4px' }, ( props ) => {
	if ( props.active ) {
		return {
			color: '#FFF',
			background: '#101517',

			'&:hover': {
				color: '#FFF !important',
			},
		};
	}

	return {
		color: '#50575E',

		'&:hover': {
			background: '#F6F7F7',
		},
	};
} );

export const SitesDisplayModeSwitcher = () => {
	return (
		<div className={ container }>
			<SiteSwitcherButton icon={ <SitesTileIcon /> } active={ false } />
			<SiteSwitcherButton icon={ <SitesRowsIcon /> } active />
		</div>
	);
};
