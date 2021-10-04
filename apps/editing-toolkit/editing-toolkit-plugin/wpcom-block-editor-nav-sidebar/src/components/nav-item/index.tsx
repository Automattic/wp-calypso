import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@wordpress/components';
import { forwardRef } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { _x } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { Post } from '../../types';

import './style.scss';

interface NavItemProps {
	item: Post;
	postType: { slug: string };
	selected: boolean;
	statusLabel?: string;
}

const NavItem = forwardRef< HTMLLIElement, NavItemProps >(
	( { item, postType, selected, statusLabel }, ref ) => {
		const buttonClasses = classNames( 'wpcom-block-editor-nav-item', {
			'is-selected': selected,
		} );

		const titleClasses = classNames( 'wpcom-block-editor-nav-item__title', {
			'is-untitled': ! item.title?.raw,
		} );

		const defaultEditUrl = addQueryArgs( 'post.php', { post: item.id, action: 'edit' } );
		const editUrl = applyFilters(
			'a8c.WpcomBlockEditorNavSidebar.editPostUrl',
			defaultEditUrl,
			item.id,
			postType.slug
		) as string;
		const trackEvent = () => {
			recordTracksEvent( 'calypso_editor_sidebar_item_edit', { post_type: postType.slug } );
		};

		return (
			<li ref={ ref }>
				<Button
					className={ buttonClasses }
					href={ editUrl }
					onClick={ trackEvent }
					target={
						applyFilters( 'a8c.WpcomBlockEditorNavSidebar.linkTarget', undefined ) as
							| string
							| undefined
					}
				>
					<div className={ titleClasses } title={ item.title?.raw }>
						{ item.title?.raw ||
							_x( 'Untitled', 'post title for posts with no title', 'full-site-editing' ) }
					</div>
					{ statusLabel && (
						<div className="wpcom-block-editor-nav-item__label">{ statusLabel }</div>
					) }
				</Button>
			</li>
		);
	}
);

export default NavItem;
