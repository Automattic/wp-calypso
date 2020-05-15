/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { inIframe, isSimpleSite } from './utils';

const isEditorIFramed = inIframe();

export default function ( { section, children, subsection } ) {
	const { hostname } = window.location;

	const { getCurrentPostId, getCurrentPostType } = useSelect( ( select ) => ( {
		getCurrentPostId: select( 'core/editor' ).getCurrentPostId,
		getCurrentPostType: select( 'core/editor' ).getCurrentPostType,
	} ) );

	// Search dispatchers.
	const { clickOnContextualTip } = useDispatch( 'automattic/tracking' );

	const postId = getCurrentPostId();
	const postType = getCurrentPostType();
	const returnLink =
		isEditorIFramed && ! isSimpleSite
			? '&' +
			  encodeURIComponent(
					`return=https://wordpress.com/block-editor/${ postType }/${ hostname }/${ postId }`
			  )
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
		<a
			href={ href }
			target="_blank"
			rel="noreferrer noopener"
			onClick={ () => clickOnContextualTip( { context: 'inserter_menu', section, subsection } ) }
		>
			{ children }
		</a>
	);
}
