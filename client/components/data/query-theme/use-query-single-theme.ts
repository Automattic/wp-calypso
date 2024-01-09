import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { requestSingleTheme } from 'calypso/state/themes/actions/request-theme';
import { isRequestingTheme } from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
import { AppState } from 'calypso/types';

export type SourceType = 'wpcom' | 'wporg' | 'jetpack';

const request =
	( siteId: number | null, themeId: string, sourceType: SourceType ) =>
	( dispatch: CalypsoDispatch, getState: AppState ) => {
		if ( ! isRequestingTheme( getState(), siteId as number, themeId ) ) {
			dispatch( requestSingleTheme( themeId, siteId, sourceType ) );
		}
	};

export function useQuerySingleTheme(
	siteId: number | null,
	themeId: string,
	sourceType: SourceType
) {
	const dispatch = useDispatch();
	useEffect( () => {
		if ( sourceType && themeId ) {
			dispatch( request( siteId, themeId, sourceType ) );
		}
	}, [ dispatch, siteId, sourceType, themeId ] );
}
