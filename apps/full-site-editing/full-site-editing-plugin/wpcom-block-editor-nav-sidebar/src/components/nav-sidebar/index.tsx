/**
 * External dependencies
 */
import { useLayoutEffect, useRef } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	Button as OriginalButton,
	IsolatedEventContainer,
	withConstrainedTabbing,
} from '@wordpress/components';
import { chevronLeft, wordpress } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { applyFilters, doAction, hasAction } from '@wordpress/hooks';
import { get } from 'lodash';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { ESCAPE } from '@wordpress/keycodes';
import { compose } from '@wordpress/compose';

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

function WpcomBlockEditorNavSidebar() {
	const { toggleSidebar, setSidebarClosing } = useDispatch( STORE_KEY );
	const [ isOpen, isClosing, postType, selectedItemId ] = useSelect( ( select ) => {
		const { getPostType } = select( 'core' ) as any;

		return [
			select( STORE_KEY ).isSidebarOpened(),
			select( STORE_KEY ).isSidebarClosing(),
			getPostType( select( 'core/editor' ).getCurrentPostType() ),
			select( 'core/editor' ).getCurrentPostId(),
		];
	} );

	const items = useNavItems();
	const statusLabels = usePostStatusLabels();

	const prevIsOpen = useRef( isOpen );

	// Using layout effect to prevent a brief moment in time where both `isOpen` and `isClosing`
	// are both false, causing a flicker during the fade out animation.
	useLayoutEffect( () => {
		if ( ! isOpen && prevIsOpen.current ) {
			// Check current and previous isOpen value to see if we're closing
			setSidebarClosing( true );
		}

		prevIsOpen.current = isOpen;
	}, [ isOpen, prevIsOpen, setSidebarClosing ] );

	if ( ! postType ) {
		// Still loading
		return null;
	}

	if ( ! isOpen && ! isClosing ) {
		// Remove from DOM when closed so sidebar doesn't participate in tab order
		return null;
	}

	let closeUrl = addQueryArgs( 'edit.php', { post_type: postType.slug } );
	closeUrl = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeUrl', closeUrl );

	let closeLabel = get( postType, [ 'labels', 'all_items' ], __( 'Back', 'full-site-editing' ) );
	closeLabel = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeLabel', closeLabel );

	const handleClose = ( e: React.MouseEvent ) => {
		if ( hasAction( 'a8c.wpcom-block-editor.closeEditor' ) ) {
			e.preventDefault();
			doAction( 'a8c.wpcom-block-editor.closeEditor' );
		}
	};

	const dismissSidebar = () => {
		if ( isOpen && ! isClosing ) {
			toggleSidebar();
		}
	};

	const handleClickGuard = ( e: React.MouseEvent ) => {
		if ( e.currentTarget === e.target ) {
			dismissSidebar();
		}
	};

	const handleKeyDown = ( e: React.KeyboardEvent ) => {
		if ( e.keyCode === ESCAPE ) {
			e.stopPropagation();
			dismissSidebar();
		}
	};

	return (
		<IsolatedEventContainer
			className={ classNames( 'wpcom-block-editor-nav-sidebar-nav-sidebar__click-guard', {
				'is-fading-out': isClosing,
			} ) }
			onAnimationEnd={ ( ev: React.AnimationEvent ) => {
				if (
					ev.animationName === 'wpcom-block-editor-nav-sidebar-nav-sidebar__fade' &&
					isClosing
				) {
					setSidebarClosing( false );
				}
			} }
			onClick={ handleClickGuard }
			onKeyDown={ handleKeyDown }
		>
			<div
				className={ classNames( 'wpcom-block-editor-nav-sidebar-nav-sidebar__container', {
					'is-sliding-left': isClosing,
				} ) }
				ref={ ( el ) => el && el.focus() }
				role="dialog"
				tabIndex={ -1 }
			>
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__header">
					<Button
						className={ classNames(
							'edit-post-fullscreen-mode-close',
							'wpcom-block-editor-nav-sidebar-nav-sidebar__dismiss-sidebar-button',
							{
								'is-growing': isClosing,
							}
						) }
						icon={ wordpress }
						iconSize={ 36 }
						onClick={ dismissSidebar }
					/>
				</div>
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
		</IsolatedEventContainer>
	);
}

export default compose( [ withConstrainedTabbing ] )( WpcomBlockEditorNavSidebar );

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
