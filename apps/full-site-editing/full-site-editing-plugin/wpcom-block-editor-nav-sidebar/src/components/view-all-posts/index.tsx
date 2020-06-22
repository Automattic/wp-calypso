/**
 * External dependencies
 */
import { get } from 'lodash';
import { Button as OriginalButton } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	postType: { slug: string };
}

const Button = ( { children, ...rest }: OriginalButton.Props & { isSecondary?: boolean } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function ViewAllPosts( { postType }: Props ) {
	const defaultLabel = get(
		postType,
		[ 'labels', 'view_items' ],
		__( 'Back', 'full-site-editing' )
	);
	const label = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.allPostsLabel',
		defaultLabel,
		postType.slug
	);

	const defaultUrl = addQueryArgs( 'edit.php', { post_type: postType.slug } );
	const url = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.allPostsUrl',
		defaultUrl,
		postType.slug
	);

	return (
		<Button
			target={ applyFilters( 'a8c.WpcomBlockEditorNavSidebar.linkTarget', undefined ) }
			isSecondary
			className="wpcom-block-editor-nav-sidebar-view-all-posts"
			href={ url }
		>
			{ label }
		</Button>
	);
}
