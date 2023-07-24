import { Button } from '@automattic/components';

export const LivePreviewButton = ( {
	isActive,
	isAtomic,
	isExternallyManagedTheme,
	isWporg,
	showTryAndCustomize,
	siteSlug,
	stylesheet,
} ) => {
	if ( isActive ) {
		return null;
	}
	if ( showTryAndCustomize ) {
		return null;
	}
	if ( isAtomic ) {
		return null;
	}
	if ( isExternallyManagedTheme || isWporg ) {
		return null;
	}
	return (
		<Button href={ `https://${ siteSlug }/wp-admin/site-editor.php?theme_preview=${ stylesheet }` }>
			Live Preview (PoC)
		</Button>
	);
};
