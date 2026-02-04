/**
 * A link component that prompts the user to navigate to the Site Editor
 * for features that are only available there.
 */
export default function EditorLink() {
	return (
		<p>
			Open <a href="/wp-admin/site-editor.php?canvas=edit">Site Editor</a> to access this feature.
		</p>
	);
}
