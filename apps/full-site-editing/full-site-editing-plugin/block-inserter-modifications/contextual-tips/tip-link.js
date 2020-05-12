/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { isGutenframed } from './utils';

const isEditorIFramed = isGutenframed();
const isSimpleSite = !! (
	window &&
	window._currentSiteType &&
	window._currentSiteType === 'simple'
);

export default function ( { section, children, subsection } ) {
	const { hostname } = window.location;
	let href = '#';

	switch ( section ) {
		case 'themes':
			href = isEditorIFramed ? `https://wordpress.com/themes/${ hostname }` : './themes.php';
			break;

		case 'plugins':
			href = isEditorIFramed
				? `https://wordpress.com/plugins/${ hostname }`
				: './plugin-install.php';
			break;

		case 'customizer':
			const editorSelector = select( 'core/editor' );
			const postId = editorSelector.getCurrentPostId();
			const postType = editorSelector.getCurrentPostType();
			const returnLink =
				isEditorIFramed && ! isSimpleSite
					? '&' +
					  encodeURIComponent(
							`return=https://wordpress.com/block-editor/${ postType }/${ hostname }/${ postId }`
					  )
					: '';
			const autofocus = `autofocus[section]=${ subsection }`;

			href =
				isEditorIFramed && isSimpleSite
					? `https://wordpress.com/customize/${ hostname }?${ autofocus }`
					: `./customize.php?${ autofocus }${ returnLink }`;
			break;
	}

	return (
		<a href={ href } target="_blank" rel="noreferrer noopener">
			{ children }
		</a>
	);
}
