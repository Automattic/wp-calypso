import { useDispatch, useSelect } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __, sprintf } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { getQueryArg } from '@wordpress/url';
import { useEffect } from 'react';

/**
 * Return true if the user is currently previewing a theme.
 * FIXME: This is copied from Gutenberg; we should be creating a selector for the `core/edit-site` store.
 * @see https://github.com/WordPress/gutenberg/blob/053c8f733c85d80c891fa308b071b9a18e5194e9/packages/edit-site/src/utils/is-previewing-theme.js#L6
 * @returns {boolean} isPreviewingTheme
 */
function isPreviewingTheme() {
	return getQueryArg( window.location.href, 'wp_theme_preview' ) !== undefined;
}

/**
 * Return the theme slug if the user is currently previewing a theme.
 * FIXME: This is copied from Gutenberg; we should be creating a selector for the `core/edit-site` store.
 * @see https://github.com/WordPress/gutenberg/blob/053c8f733c85d80c891fa308b071b9a18e5194e9/packages/edit-site/src/utils/is-previewing-theme.js#L6
 * @returns {string|null} currentlyPreviewingTheme
 */
function currentlyPreviewingTheme() {
	if ( isPreviewingTheme() ) {
		return getQueryArg( window.location.href, 'wp_theme_preview' );
	}
	return null;
}

/**
 * Sometimes Gutenberg doesn't allow you to re-register the module and throws an error.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let unlock: ( object: any ) => any | undefined;
try {
	unlock = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
		'I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.',
		'@wordpress/edit-site'
	).unlock;
} catch ( error ) {
	// eslint-disable-next-line no-console
	console.error( 'Error: Unable to get the unlock api. Reason: %s', error );
}

const NOTICE_ID = 'wpcom-live-preview/notice';

/**
 * This is an interim solution to clarify to users that they are currently live previewing a theme.
 * And this should be moved to jetpack-mu-wpcom.
 * @see https://github.com/Automattic/wp-calypso/issues/82218
 */
const LivePreviewNotice = () => {
	const { createWarningNotice, removeNotice } = useDispatch( 'core/notices' );

	const { previewingThemeName, currentTheme } = useSelect( ( select ) => {
		const previewingThemeSlug = currentlyPreviewingTheme();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const previewingTheme = ( select( 'core' ) as any ).getTheme( previewingThemeSlug );
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const currentTheme = ( select( 'core' ) as any ).getCurrentTheme();

		return {
			previewingThemeName: previewingTheme?.name?.rendered || previewingThemeSlug,
			currentTheme,
		};
	}, [] );

	const siteEditorStore = useSelect( ( select ) => select( 'core/edit-site' ), [] );
	const dashboardLink =
		unlock &&
		siteEditorStore &&
		unlock( siteEditorStore ).getSettings().__experimentalDashboardLink;

	useEffect( () => {
		// Do nothing in the Post Editor context.
		if ( ! siteEditorStore ) {
			return;
		}
		if ( ! isPreviewingTheme() ) {
			removeNotice( NOTICE_ID );
		} else {
			createWarningNotice(
				sprintf(
					// translators: %s: theme name
					__(
						'You are previewing the %s theme. You can try out your own style customizations, which will only be saved if you activate this theme.',
						'wpcom-live-preview'
					),
					previewingThemeName
				),
				{
					id: NOTICE_ID,
					isDismissible: false,
					actions: dashboardLink && [
						{
							label: __( 'Back to themes', 'wpcom-live-preview' ),
							url: dashboardLink,
							variant: 'secondary',
						},
					],
				}
			);
		}
		return () => removeNotice( NOTICE_ID );
	}, [
		siteEditorStore,
		dashboardLink,
		createWarningNotice,
		removeNotice,
		previewingThemeName,
		currentTheme,
	] );
	return null;
};

const registerLivePreviewPlugin = () => {
	registerPlugin( 'wpcom-live-preview', {
		render: () => <LivePreviewNotice />,
	} );
};

domReady( () => {
	registerLivePreviewPlugin();
} );
