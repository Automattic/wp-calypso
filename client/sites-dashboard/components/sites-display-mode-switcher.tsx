import { css } from '@emotion/css';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ComponentProps } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';
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

type SitesDisplayMode = 'tile' | 'list' | 'none';

const PREFERENCE_NAME = 'sites-management-dashboard-display-mode';

export const SitesDisplayModeSwitcher = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const onDisplayModeChange = ( value: SitesDisplayMode ) => {
		dispatch( savePreference( PREFERENCE_NAME, value ) );
	};

	const displayMode: SitesDisplayMode = useSelector( ( state ) => {
		if ( ! hasReceivedRemotePreferences( state ) ) {
			return 'none';
		}

		return getPreference( state, PREFERENCE_NAME ) ?? 'list';
	} );

	return (
		<div className={ container } role="radiogroup" aria-label={ __( 'Sites display mode' ) }>
			<SiteSwitcherButton
				role="radio"
				aria-label={ __( 'Tile view' ) }
				onClick={ () => onDisplayModeChange( 'tile' ) }
				icon={ <SitesTilesIcon /> }
				isPressed={ displayMode === 'tile' }
			/>
			<SiteSwitcherButton
				role="radio"
				aria-label={ __( 'List view' ) }
				onClick={ () => onDisplayModeChange( 'list' ) }
				icon={ <SitesListIcon /> }
				isPressed={ displayMode === 'list' }
			/>
		</div>
	);
};
