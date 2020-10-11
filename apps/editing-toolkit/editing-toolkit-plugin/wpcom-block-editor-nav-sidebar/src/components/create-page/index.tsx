/**
 * External dependencies
 */
import { get } from 'lodash';
import { Button as OriginalButton } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './style.scss';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

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

	const trackEvent = () => {
		recordTracksEvent( `calypso_editor_sidebar_item_add`, { post_type: postType.slug } );
	};

	return (
		<Button
			target={ applyFilters( 'a8c.WpcomBlockEditorNavSidebar.linkTarget', undefined ) }
			isPrimary
			className="wpcom-block-editor-nav-sidebar-create-page"
			href={ url }
			icon={ plus }
			onClick={ trackEvent }
		>
			{ label }
		</Button>
	);
}
