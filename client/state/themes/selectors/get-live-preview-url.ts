import config from '@automattic/calypso-config';
import { addQueryArgs } from 'calypso/lib/route';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { AppState } from 'calypso/types';
import { getTheme } from '.';

const QUERY_NAME = 'wp_theme_preview';

export const getLivePreviewUrl = ( state: AppState, themeId: string, siteId: number ) => {
	if ( ! config.isEnabled( 'themes/block-theme-previews' ) ) {
		return undefined;
	}

	const siteEditorUrl = getSiteEditorUrl( state, siteId );

	if ( isSiteAutomatedTransfer( state, siteId ) ) {
		return addQueryArgs( { [ QUERY_NAME ]: themeId }, `${ siteEditorUrl }` );
	}

	const theme = getTheme( state, 'wpcom', themeId );
	if ( ! theme ) {
		return siteEditorUrl;
	}
	return addQueryArgs( { [ QUERY_NAME ]: theme.stylesheet }, `${ siteEditorUrl }` );
};
