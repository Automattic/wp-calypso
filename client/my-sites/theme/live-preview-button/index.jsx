import { Button } from '@automattic/components';

/**
 * Live Preview leveraging Gutenberg's Block Theme Previews
 *
 * @see pbxlJb-3Uv-p2
 */
export const LivePreviewButton = ( {
	isAtomic,
	isLivePreviewSupported,
	siteSlug,
	stylesheet,
	themeId,
	translate,
} ) => {
	if ( ! isLivePreviewSupported ) {
		return null;
	}

	const themePath = isAtomic ? themeId : stylesheet;

	return (
		<Button
			href={ `https://${ siteSlug }/wp-admin/site-editor.php?wp_theme_preview=${ themePath }` }
		>
			{ translate( 'Live Preview' ) }
		</Button>
	);
};
