import { addQueryArgs } from '@wordpress/url';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

const panels = [ 'root', 'wp_global_styles' ] as const;

export function useSiteEditorUrls() {
	const { site } = useHelpCenterContext();

	const siteEditorUrl = `${ site?.options.admin_url }site-editor.php`;

	return Object.fromEntries(
		panels.map( ( panel ) => [
			panel,
			panel === 'root' ? siteEditorUrl : addQueryArgs( siteEditorUrl, { path: `/${ panel }` } ),
		] )
	) as Record< ( typeof panels )[ number ], string >;
}
