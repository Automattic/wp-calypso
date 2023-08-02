import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { useDispatch, useSelector } from 'calypso/state';
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
	const translate = useTranslate();
	const dispatch = useDispatch();
	const requestStarted = useSelector( ( state ) => isRequestingActiveTheme( state, siteId ) );

	const activeTheme = useSelector( ( state ) => getActiveTheme( state, siteId ) );

	const [ attempts, setAttempts ] = useState( 0 );
	const [ exceededMaxAttempts, setExceededMaxAttempts ] = useState( false );
	const [ checkCompleted, setCheckCompleted ] = useState( false );
	const [ lastRequestStarted, setLastRequestStarted ] = useState( true );

	useEffect( () => {
		if ( exceededMaxAttempts ) {
			dispatch(
				recordTracksEvent( 'calypso_sync_active_theme_exceeded_max_attempts', {
					delay,
					max_attempts: maxAttempts,
					theme: themeId,
				} )
			);
			return onFailure?.(
				translate( 'Failed to check the theme activation status, please try again.' )
			);
		}
	}, [ exceededMaxAttempts, delay, maxAttempts, themeId, translate ] );

	useEffect( () => {
		if ( checkCompleted ) {
			return;
		}

		if ( activeTheme === themeId ) {
			setCheckCompleted( true );
			return onAtomicThemeActive();
		}

		if ( requestStarted ) {
			setLastRequestStarted( true );
		}

		if ( ! requestStarted && lastRequestStarted && attempts < maxAttempts ) {
			setAttempts( attempts + 1 );
			setLastRequestStarted( false );
			waitFor( delay ).then( () => dispatch( requestActiveTheme( siteId ) ) );
		} else if ( attempts >= maxAttempts ) {
			setExceededMaxAttempts( true );
		}
	}, [
		requestStarted,
		activeTheme,
		themeId,
		attempts,
		maxAttempts,
		delay,
		siteId,
		setExceededMaxAttempts,
		checkCompleted,
		setCheckCompleted,
		lastRequestStarted,
		setLastRequestStarted,
	] );

	return null;
};

export default SyncActiveTheme;
