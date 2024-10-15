import { addQueryArgs } from '@wordpress/url';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

const panels = [ 'root', 'wp_global_styles' ] as const;

export function useSiteEditorUrls() {
	const { site } = useHelpCenterContext();
	const returnUrl = window.location.href;

	const siteEditorUrl = `${ site?.options.admin_url }site-editor.php`;

	return panels.reduce(
		( acc, panel ) => {
			let url = siteEditorUrl;
			if ( panel !== 'root' ) {
				url = addQueryArgs( siteEditorUrl, {
					path: `/${ panel }`,
				} );
			}

			acc[ panel ] = addQueryArgs( url, {
				return: returnUrl,
			} );

			return acc;
		},
		{} as Record< ( typeof panels )[ number ], string >
	);
}
