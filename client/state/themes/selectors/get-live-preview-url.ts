import { addQueryArgs } from 'calypso/lib/route';
import getSiteEditorUrl from 'calypso/state/selectors/get-site-editor-url';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { AppState } from 'calypso/types';
import { getTheme } from '.';

type LivePreviewUrlOptions = {
	wpcomBackUrl?: string;
};

const WP_THEME_PREVIEW_QUERY_NAME = 'wp_theme_preview';
const WPCOM_BACK_URL_QUERY_NAME = 'wpcom_dashboard_link';

export const getLivePreviewUrl = (
	state: AppState,
	themeId: string,
	siteId: number,
	options: LivePreviewUrlOptions = {}
) => {
	const theme = getTheme( state, 'wpcom', themeId );
	let url = getSiteEditorUrl( state, siteId );
	let previewingTheme = '';
	if ( isSiteAutomatedTransfer( state, siteId ) ) {
		previewingTheme = themeId;
	} else if ( theme ) {
		previewingTheme = theme.stylesheet;
	}

	if ( previewingTheme ) {
		url = addQueryArgs( { [ WP_THEME_PREVIEW_QUERY_NAME ]: previewingTheme }, url );
	}

	const wpcomBackUrl =
		options.wpcomBackUrl && options.wpcomBackUrl.replace( window.location.origin, '' );
	if ( wpcomBackUrl ) {
		url = addQueryArgs( { [ WPCOM_BACK_URL_QUERY_NAME ]: wpcomBackUrl }, url );
	}

	return url;
};
