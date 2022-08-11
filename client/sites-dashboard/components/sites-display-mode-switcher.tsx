import { Gridicon } from '@automattic/components';
import { css } from '@emotion/css';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useStore, useSelector } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

const container = css( {
	marginLeft: 'auto',
	display: 'flex',
	gap: '10px',
} );

export type SitesDisplayMode = 'tile' | 'list' | 'none';

const PREFERENCE_NAME = 'sites-management-dashboard-display-mode';

export const useSitesDisplayMode = () => {
	const store = useStore();
	const dispatch = useDispatch();

	const reduxHasLoaded = useSelector( hasReceivedRemotePreferences );

	const [ displayMode, setDisplayModeInner ] = useState< SitesDisplayMode >( () => {
		if ( ! reduxHasLoaded ) {
			return 'none';
		}
		return getPreference( store.getState(), PREFERENCE_NAME ) ?? 'tile';
	} );

	useEffect( () => {
		if ( reduxHasLoaded ) {
			setDisplayModeInner( getPreference( store.getState(), PREFERENCE_NAME ) ?? 'tile' );
		}
	}, [ reduxHasLoaded, store ] );

	const setDisplayMode = useCallback(
		( newValue: SitesDisplayMode ) => {
			setDisplayModeInner( newValue );
			dispatch( savePreference( PREFERENCE_NAME, newValue ) );
		},
		[ dispatch, setDisplayModeInner ]
	);

	return [ displayMode, setDisplayMode ] as const;
};

interface SitesDisplayModeSwitcherProps {
	displayMode: SitesDisplayMode;
	onDisplayModeChange: ( newMode: SitesDisplayMode ) => void;
}

export const SitesDisplayModeSwitcher = ( {
	displayMode,
	onDisplayModeChange,
}: SitesDisplayModeSwitcherProps ) => {
	const { __ } = useI18n();

	return (
		<div className={ container } role="radiogroup" aria-label={ __( 'Sites display mode' ) }>
			<Button
				role="radio"
				aria-label={ __( 'Tile view' ) }
				onClick={ () => onDisplayModeChange( 'tile' ) }
				icon={ <Gridicon icon="grid" /> }
				isPressed={ displayMode === 'tile' }
			/>
			<Button
				role="radio"
				aria-label={ __( 'List view' ) }
				onClick={ () => onDisplayModeChange( 'list' ) }
				icon={ <Gridicon icon="list-unordered" /> }
				isPressed={ displayMode === 'list' }
			/>
		</div>
	);
};
