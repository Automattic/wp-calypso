import { select } from '@wordpress/data';
import { inIframe, isSimpleSite } from './utils';

const isEditorIFramed = inIframe();

export default function ( { section, children, subsection } ) {
	const { hostname } = window.location;
	const editorSelector = select( 'core/editor' );
	const postId = editorSelector.getCurrentPostId();
	const postType = editorSelector.getCurrentPostType();
	const returnLink =
		isEditorIFramed && ! isSimpleSite
			? '&' +
			  encodeURIComponent( `return=https://wordpress.com/${ postType }/${ hostname }/${ postId }` )
			: '';
	const autofocus = `autofocus[section]=${ subsection }`;

	let href = '#';

	switch ( section ) {
		case 'themes':
			href = isEditorIFramed ? `https://wordpress.com/themes/${ hostname }` : './themes.php';
			break;

		case 'plugins':
			href =
				isEditorIFramed || isSimpleSite
					? `https://wordpress.com/plugins/${ hostname }`
					: './plugin-install.php';
			break;

		case 'customizer':
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
