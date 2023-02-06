import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { isRequestingActiveTheme, getActiveTheme } from 'calypso/state/themes/selectors';

interface SyncActiveThemeProps {
	siteId: number;
	themeId: string;
	onThemeActive: CallableFunction;
	maxAttempts?: number;
	delay?: number;
}

const SyncActiveTheme = ( {
	siteId,
	themeId,
	onThemeActive,
	maxAttempts = 50,
	delay = 2,
}: SyncActiveThemeProps ) => {
	const dispatch = useDispatch();
	const requestStarted = useSelector( ( state ) => isRequestingActiveTheme( state, siteId ) );

	const activeTheme = useSelector( ( state ) => getActiveTheme( state, siteId ) );

	const [ attempts, setAttempts ] = useState( 0 );

	useEffect( () => {
		if ( activeTheme === themeId ) {
			return onThemeActive();
		}
		if ( ! requestStarted && attempts < maxAttempts ) {
			setAttempts( attempts + 1 );
			waitFor( delay ).then( () => dispatch( requestActiveTheme( siteId ) ) );
		}
	}, [ siteId, dispatch, requestStarted, activeTheme ] );

	return null;
};

export default SyncActiveTheme;
