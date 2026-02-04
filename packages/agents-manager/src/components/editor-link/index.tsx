import { useAgentsManagerContext } from '../../contexts';

/**
 * A link component that prompts the user to navigate to the Site Editor
 * for features that are only available there.
 */
export default function EditorLink() {
	const { site } = useAgentsManagerContext();

	// Don't render the link if site data is unavailable
	if ( ! site?.URL ) {
		return null;
	}

	return (
		<p>
			Open <a href={ `${ site.URL }/wp-admin/site-editor.php?canvas=edit` }>Site Editor</a> to
			access this feature.
		</p>
	);
}
