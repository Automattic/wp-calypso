import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import { SitesListIcon } from './sites-list-icon';
import { SitesTilesIcon } from './sites-tiles-icon';

const container = css( {
	marginLeft: 'auto',
	display: 'flex',
	gap: '10px',
} );

const SiteSwitcherButton = styled( Button )< ComponentProps< typeof Button > >(
	{ borderRadius: '4px' },
	( props ) => {
		if ( props.isPressed ) {
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
	}
);

export const SitesDisplayModeSwitcher = () => {
	const { __ } = useI18n();

	return (
		<div className={ container } role="radiogroup" aria-label={ __( 'Sites display mode' ) }>
			<SiteSwitcherButton
				role="radio"
				aria-label={ __( 'Tile view' ) }
				icon={ <SitesTilesIcon /> }
				isPressed={ false }
			/>
			<SiteSwitcherButton
				role="radio"
				aria-label={ __( 'List view' ) }
				icon={ <SitesListIcon /> }
				isPressed
			/>
		</div>
	);
};
