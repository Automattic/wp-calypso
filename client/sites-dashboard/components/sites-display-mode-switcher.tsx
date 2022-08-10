import { Gridicon } from '@automattic/components';
import { css } from '@emotion/css';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
	const displayMode: SitesDisplayMode = useSelector( ( state ) => {
		if ( ! hasReceivedRemotePreferences( state ) ) {
			return 'none';
		}

		return getPreference( state, PREFERENCE_NAME ) ?? 'tile';
	} );

	return displayMode;
};

export const SitesDisplayModeSwitcher = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const [ isSaving, setIsSaving ] = useState( false );

	const onDisplayModeChange = async ( value: SitesDisplayMode ) => {
		const saveDisplayMode = savePreference( PREFERENCE_NAME, value );

		try {
			setIsSaving( true );
			await saveDisplayMode( dispatch );
		} finally {
			setIsSaving( false );
		}
	};

	const displayMode = useSitesDisplayMode();

	return (
		<div className={ container } role="radiogroup" aria-label={ __( 'Sites display mode' ) }>
			<Button
				role="radio"
				aria-label={ __( 'Tile view' ) }
				onClick={ () => onDisplayModeChange( 'tile' ) }
				disabled={ isSaving }
				icon={ <Gridicon icon="grid" /> }
				isPressed={ displayMode === 'tile' }
			/>
			<Button
				role="radio"
				aria-label={ __( 'List view' ) }
				onClick={ () => onDisplayModeChange( 'list' ) }
				disabled={ isSaving }
				icon={ <Gridicon icon="list-unordered" /> }
				isPressed={ displayMode === 'list' }
			/>
		</div>
	);
};
