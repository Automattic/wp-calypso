import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { isRequestingActiveTheme, getActiveTheme } from 'calypso/state/themes/selectors';

interface SyncActiveThemeProps {
	siteId: number;
	themeId: string;
	onAtomicThemeActive: CallableFunction;
	onFailure?: CallableFunction;
	maxAttempts?: number;
	delay?: number;
}

const SyncActiveTheme = ( {
	siteId,
	themeId,
	onAtomicThemeActive,
	onFailure,
	maxAttempts = 50,
	delay = 2,
}: SyncActiveThemeProps ) => {
	const dispatch = useDispatch();
	const requestStarted = useSelector( ( state ) => isRequestingActiveTheme( state, siteId ) );

	const activeTheme = useSelector( ( state ) => getActiveTheme( state, siteId ) );

	const [ attempts, setAttempts ] = useState( 0 );
	const [ exceededMaxAttempts, setExceededMaxAttempts ] = useState( false );

	useEffect( () => {
		if ( exceededMaxAttempts ) {
			dispatch( recordTracksEvent( 'calypso_sync_active_theme_exceeded_max_attempts' ) );
			return onFailure?.(
				translate( 'Failed to check the theme activation status, please try again.' )
			);
		}
	}, [ exceededMaxAttempts ] );

	useEffect( () => {
		if ( activeTheme === themeId ) {
			return onAtomicThemeActive();
		}
		if ( ! requestStarted && attempts < maxAttempts ) {
			setAttempts( attempts + 1 );
			waitFor( delay ).then( () => dispatch( requestActiveTheme( siteId ) ) );
		} else if ( attempts >= maxAttempts ) {
			setExceededMaxAttempts( true );
		}
	}, [ siteId, dispatch, requestStarted, activeTheme ] );

	return null;
};

export default SyncActiveTheme;
