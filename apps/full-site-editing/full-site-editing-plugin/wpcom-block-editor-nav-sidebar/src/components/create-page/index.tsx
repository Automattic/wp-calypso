/**
 * External dependencies
 */
import { get } from 'lodash';
import { Button } from '@wordpress/components';
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

export default function CreatePage( { postType }: Props ) {
	const defaultLabel = get(
		postType,
		[ 'labels', 'add_new_item' ],
		__( 'Create', 'full-site-editing' )
	);
	const label = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.createPostLabel',
		defaultLabel,
		postType.slug
	);

	const defaultUrl = addQueryArgs( 'post-new.php', { post_type: postType.slug } );
	const url = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.createPostUrl',
		defaultUrl,
		postType.slug
	);

	return (
		<Button
			target={ applyFilters( 'a8c.WpcomBlockEditorNavSidebar.linkTarget', undefined ) }
			isPrimary
			className="wpcom-block-editor-nav-sidebar-create-page"
			href={ url }
		>
			{ label }
		</Button>
	);
}
