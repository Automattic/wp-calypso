import { Gridicon } from '@automattic/components';
import { css } from '@emotion/css';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

const container = css( {
	marginLeft: 'auto',
	display: 'flex',
	gap: '10px',
} );

type SitesDisplayMode = 'tile' | 'list' | 'none';

const PREFERENCE_NAME = 'sites-management-dashboard-display-mode';

export const useSitesDisplayMode = () => {
	const store = useStore();
	const dispatch = useDispatch();
	const remotePreferencesLoaded = useSelector( hasReceivedRemotePreferences );

	const [ displayMode, setLocalDisplayMode ] = useState< SitesDisplayMode >( () => {
		if ( ! remotePreferencesLoaded ) {
			return 'none';
		}

		return getPreference( store.getState(), PREFERENCE_NAME ) ?? 'tile';
	} );

	useEffect( () => {
		if ( remotePreferencesLoaded ) {
			setLocalDisplayMode( getPreference( store.getState(), PREFERENCE_NAME ) ?? 'tile' );
		}
	}, [ remotePreferencesLoaded, store ] );

	const setDisplayMode = useCallback(
		( newValue: SitesDisplayMode ) => {
			setLocalDisplayMode( newValue );
			dispatch( savePreference( PREFERENCE_NAME, newValue ) );
		},
		[ dispatch ]
	);

	return [ displayMode, setDisplayMode ] as const;
};

export const SitesDisplayModeSwitcher = () => {
	const { __ } = useI18n();

	const [ displayMode, setDisplayMode ] = useSitesDisplayMode();

	return (
		<div className={ container } role="radiogroup" aria-label={ __( 'Sites display mode' ) }>
			<Button
				role="radio"
				aria-label={ __( 'Tile view' ) }
				onClick={ () => setDisplayMode( 'tile' ) }
				icon={ <Gridicon icon="grid" /> }
				isPressed={ displayMode === 'tile' }
			/>
			<Button
				role="radio"
				aria-label={ __( 'List view' ) }
				onClick={ () => setDisplayMode( 'list' ) }
				icon={ <Gridicon icon="list-unordered" /> }
				isPressed={ displayMode === 'list' }
			/>
		</div>
	);
};
