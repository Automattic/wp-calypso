import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button as OriginalButton } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { get } from 'lodash';

import './style.scss';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: unknown; iconSize?: number } ) => (
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
	) as string;

	const defaultUrl = addQueryArgs( 'post-new.php', { post_type: postType.slug } );
	const url = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.createPostUrl',
		defaultUrl,
		postType.slug
	) as string;

	const trackEvent = () => {
		recordTracksEvent( `calypso_editor_sidebar_item_add`, { post_type: postType.slug } );
	};

	return (
		<Button
			target={
				applyFilters( 'a8c.WpcomBlockEditorNavSidebar.linkTarget', undefined ) as string | undefined
			}
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
