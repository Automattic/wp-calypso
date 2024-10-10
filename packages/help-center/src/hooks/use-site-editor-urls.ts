import { addQueryArgs } from '@wordpress/url';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useSiteSlug } from './use-site-slug';

const panels = [ 'root', 'wp_global_styles' ] as const;

export function useSiteEditorUrls() {
	const { site } = useHelpCenterContext();
	const siteSlug = useSiteSlug();
	const returnUrl = window.location.href;

	if ( site?.is_core_site_editor_enabled ) {
		const siteEditorUrl = `${ site?.options.admin_url }site-editor.php`;

		return panels.reduce(
			( acc, panel ) => {
				if ( ! site?.jetpack && siteSlug ) {
					let url = siteEditorUrl;
					if ( panel !== 'root' ) {
						url = `${ siteEditorUrl }?path=${ panel }&canvas=edit`;
					}

					acc[ panel ] = addQueryArgs( url, {
						return: returnUrl,
					} );
				} else {
					acc[ panel ] = addQueryArgs( siteEditorUrl, {
						return: returnUrl,
					} );
				}
				return acc;
			},
			{} as Record< ( typeof panels )[ number ], string >
		);
	}

	return [];
}
