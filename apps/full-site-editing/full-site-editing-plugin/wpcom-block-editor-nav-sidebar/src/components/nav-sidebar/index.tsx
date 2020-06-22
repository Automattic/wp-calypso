/**
 * External dependencies
 */
import { WPSyntheticEvent } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Button as OriginalButton } from '@wordpress/components';
import { chevronLeft } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { applyFilters, doAction, hasAction } from '@wordpress/hooks';
import { get } from 'lodash';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../constants';
import CreatePage from '../create-page';
import ViewAllPosts from '../view-all-posts';
import NavItem from '../nav-item';
import { Post } from '../../types';
import './style.scss';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function WpcomBlockEditorNavSidebar() {
	const [ isOpen, postType, selectedItemId ] = useSelect( ( select ) => {
		const { getPostType } = select( 'core' ) as any;

		return [
			select( STORE_KEY ).isSidebarOpened(),
			getPostType( select( 'core/editor' ).getCurrentPostType() ),
			select( 'core/editor' ).getCurrentPostId(),
		];
	} );

	const items = useNavItems();
	const statusLabels = usePostStatusLabels();

	if ( ! postType ) {
		// Still loading
		return null;
	}

	let closeUrl = addQueryArgs( 'edit.php', { post_type: postType.slug } );
	closeUrl = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeUrl', closeUrl );

	let closeLabel = get( postType, [ 'labels', 'all_items' ], __( 'Back', 'full-site-editing' ) );
	closeLabel = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeLabel', closeLabel );

	const handleClose = ( e: WPSyntheticEvent ) => {
		if ( hasAction( 'a8c.wpcom-block-editor.closeEditor' ) ) {
			e.preventDefault();
			doAction( 'a8c.wpcom-block-editor.closeEditor' );
		}
	};

	return (
		<>
			<div
				className="wpcom-block-editor-nav-sidebar-nav-sidebar__click-guard"
				aria-hidden={ ! isOpen }
			/>
			<div
				className="wpcom-block-editor-nav-sidebar-nav-sidebar__container"
				aria-hidden={ ! isOpen }
			>
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__header" />
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__home-button-container">
					<Button
						href={ closeUrl }
						className="wpcom-block-editor-nav-sidebar-nav-sidebar__home-button"
						icon={ chevronLeft }
						onClick={ handleClose }
					>
						{ closeLabel }
					</Button>
				</div>
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__controls">
					<ul className="wpcom-block-editor-nav-sidebar-nav-sidebar__page-list">
						{ items.map( ( item ) => (
							<NavItem
								key={ item.id }
								item={ item }
								postType={ postType } // We know the post type of this item is always the same as the post type of the current editor
								selected={ item.id === selectedItemId }
								statusLabel={ statusLabels[ item.status ] }
							/>
						) ) }
					</ul>
					<CreatePage postType={ postType } />
					<ViewAllPosts postType={ postType } />
				</div>
			</div>
		</>
	);
}

function useNavItems(): Post[] {
	return useSelect( ( select ) => {
		const {
			isEditedPostNew,
			getCurrentPostId,
			getCurrentPostType,
			getEditedPostAttribute,
		} = select( 'core/editor' );

		const statuses = select( 'core' ).getEntityRecords( 'root', 'status' );
		if ( ! statuses ) {
			return [];
		}

		const statusFilter = statuses
			.filter( ( { show_in_list } ) => show_in_list )
			.map( ( { slug } ) => slug )
			.join( ',' );

		const currentPostId = getCurrentPostId();
		const currentPostType = getCurrentPostType();

		const items =
			select( 'core' ).getEntityRecords( 'postType', currentPostType, {
				_fields: 'id,slug,status,title',
				exclude: [ currentPostId ],
				orderby: 'modified',
				per_page: 10,
				status: statusFilter,
			} ) || [];

		const currentPost = {
			id: currentPostId,
			slug: getEditedPostAttribute( 'slug' ),
			status: isEditedPostNew() ? 'draft' : getEditedPostAttribute( 'status' ),
			title: { raw: getEditedPostAttribute( 'title' ), rendered: '' },
		};

		return [ currentPost, ...items ] as any;
	} );
}

function usePostStatusLabels(): Record< string, string > {
	return useSelect( ( select ) => {
		const items = select( 'core' ).getEntityRecords( 'root', 'status' );
		return ( items || [] ).reduce(
			( acc, { name, slug } ) => ( slug === 'publish' ? acc : { ...acc, [ slug ]: name } ),
			{}
		);
	} );
}
