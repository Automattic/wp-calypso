/**
 * External dependencies
 */
import { useLayoutEffect, useRef, useEffect, useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	Button as OriginalButton,
	IsolatedEventContainer,
	withConstrainedTabbing,
} from '@wordpress/components';
import { chevronLeft, wordpress } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { applyFilters, doAction, hasAction } from '@wordpress/hooks';
import { get, isEmpty } from 'lodash';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { ESCAPE } from '@wordpress/keycodes';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { STORE_KEY, POST_IDS_TO_EXCLUDE } from '../../constants';
import CreatePage from '../create-page';
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
	const [ isOpen, isClosing, postType, selectedItemId, siteTitle ] = useSelect( ( select ) => {
		const { getPostType, getSite } = select( 'core' ) as any;

		return [
			select( STORE_KEY ).isSidebarOpened(),
			select( STORE_KEY ).isSidebarClosing(),
			getPostType( select( 'core/editor' ).getCurrentPostType() ),
			select( 'core/editor' ).getCurrentPostId(),
			getSite()?.title,
		];
	} );

	const { current: currentPost, drafts: draftPosts, recent: recentPosts } = useNavItems();
	console.log( 'posts', currentPost, draftPosts, recentPosts );
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

	const [ isScrollbarPresent, setIsScrollbarPresent ] = useState( false );

	const observer = useRef< IntersectionObserver >();
	const itemRefs = useRef< ( HTMLElement | null )[] >( [] );

	const containerMount = ( el: HTMLDivElement | null ) => {
		if ( el ) {
			el.focus();
		}

		if ( observer.current ) {
			observer.current.disconnect();
		}

		if ( ! window.IntersectionObserver ) {
			return;
		}

		observer.current = new window.IntersectionObserver(
			( entries ) => {
				// If one item isn't currently visible, then the scrollbar isn't present
				const isPresent = entries.some( ( entry ) => ! entry.isIntersecting );
				setIsScrollbarPresent( isPresent );
			},
			{
				root: el,
				threshold: [ 1 ], // We want to fire the above callback when an entry isn't 100% visible
			}
		);
	};

/*	const itemMount = ( el: HTMLElement | null, itemIndex: number ) => {
		itemRefs.current[ itemIndex ] = el;
	};*/

	useEffect( () => {
		if ( ! observer.current ) {
			return;
		}

		observer.current.disconnect();

		const nonSparse = itemRefs.current.filter( Boolean ) as HTMLElement[];

		// We only need to observe the first and last item in the list, might be better for performance
		const firstItem = nonSparse[ 0 ];
		const lastItem = nonSparse[ nonSparse.length - 1 ];
		if ( firstItem ) observer.current.observe( firstItem );
		if ( lastItem ) observer.current.observe( lastItem );
	}, [ currentPost, draftPosts, recentPosts, itemRefs, observer ] );

	if ( ! postType ) {
		// Still loading
		return null;
	}

	if ( ! isOpen && ! isClosing ) {
		// Remove from DOM when closed so sidebar doesn't participate in tab order
		return null;
	}

	const defaultCloseUrl = addQueryArgs( 'edit.php', { post_type: postType.slug } );
	const closeUrl = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeUrl', defaultCloseUrl );

	const defaultCloseLabel = get(
		postType,
		[ 'labels', 'all_items' ],
		__( 'Back', 'full-site-editing' )
	);
	const closeLabel = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeLabel', defaultCloseLabel );

	const handleClose = ( e: React.MouseEvent ) => {
		if ( hasAction( 'a8c.wpcom-block-editor.closeEditor' ) ) {
			e.preventDefault();
			doAction( 'a8c.wpcom-block-editor.closeEditor' );
		}
	};

	const defaultListHeading = get( postType, [ 'labels', 'name' ] );
	const listHeading = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.listHeading',
		defaultListHeading,
		postType.slug
	);

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
				ref={ containerMount }
				role="dialog"
				tabIndex={ -1 }
			>
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__header">
					<Button
						className={ classNames(
							'edit-post-fullscreen-mode-close',
							'wpcom-block-editor-nav-sidebar-nav-sidebar__dismiss-sidebar-button'
						) }
						icon={ wordpress }
						iconSize={ 36 }
						onClick={ dismissSidebar }
					/>
					<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__site-title">
						<h2>{ decodeEntities( siteTitle ) }</h2>
					</div>
				</div>
				<Button
					href={ closeUrl }
					className="wpcom-block-editor-nav-sidebar-nav-sidebar__home-button"
					icon={ chevronLeft }
					onClick={ handleClose }
				>
					{ closeLabel }
				</Button>
				<h2 className="wpcom-block-editor-nav-sidebar-nav-sidebar__list-heading">
					{ listHeading }
				</h2>
				<h3 className="wpcom-block-editor-nav-sidebar-nav-sidebar__list-subheading">
					{ __( 'Currently editing', 'full-site-editing' ) }
				</h3>
				{ ! isEmpty( currentPost ) && (
					<ul className="wpcom-block-editor-nav-sidebar-nav-sidebar__page-list">
						<NavItem
							key={ currentPost[ 0 ]?.id }
							item={ currentPost[ 0 ] }
							postType={ postType } // We know the post type of this item is always the same as the post type of the current editor
							selected={ currentPost[ 0 ]?.id === selectedItemId }
							statusLabel={ statusLabels[ currentPost[ 0 ]?.status ] }
						/>
					</ul>
				) }
				<section className="wpcom-block-editor-nav-sidebar-nav-sidebar__post-scroll-area">
					{ ! isEmpty( recentPosts ) && (
						<>
							<h3 className="wpcom-block-editor-nav-sidebar-nav-sidebar__list-subheading">
								{ __( 'Recently edited', 'full-site-editing' ) }
							</h3>
							<ul className="wpcom-block-editor-nav-sidebar-nav-sidebar__page-list">
								{ recentPosts.map( ( item ) => (
									<NavItem
										key={ item.id }
										item={ item }
										postType={ postType } // We know the post type of this item is always the same as the post type of the current editor
										selected={ item.id === selectedItemId }
										statusLabel={ statusLabels[ item.status ] }
									/>
								) ) }
							</ul>
						</>
					) }
					{ ! isEmpty( draftPosts ) && (
						<>
							<h3 className="wpcom-block-editor-nav-sidebar-nav-sidebar__list-subheading">
								{ __( 'Drafts', 'full-site-editing' ) }
							</h3>
							<ul className="wpcom-block-editor-nav-sidebar-nav-sidebar__page-list">
								{ draftPosts.map( ( item ) => (
									<NavItem
										key={ item.id }
										item={ item }
										postType={ postType } // We know the post type of this item is always the same as the post type of the current editor
										selected={ item.id === selectedItemId }
									/>
								) ) }
							</ul>
						</>
					) }
				</section>
				<div
					className={ classNames( 'wpcom-block-editor-nav-sidebar-nav-sidebar__bottom-buttons', {
						'is-scrollbar-present': isScrollbarPresent,
					} ) }
				>
					<CreatePage postType={ postType } />
				</div>
			</div>
		</IsolatedEventContainer>
	);
}

export default compose( [ withConstrainedTabbing ] )( WpcomBlockEditorNavSidebar );

function useNavItems(): Record< string, Post[] > {
	return useSelect( ( select ) => {
		const {
			isEditedPostNew,
			getCurrentPostId,
			getCurrentPostType,
			getEditedPostAttribute,
		} = select( 'core/editor' );

		const statuses = select( 'core' ).getEntityRecords( 'root', 'status' ) as any[];
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
				_fields: 'id,status,title',
				exclude: [ currentPostId, ...POST_IDS_TO_EXCLUDE ],
				orderby: 'modified',
				per_page: 10,
				status: statusFilter,
			} ) || [];

		const current = {
			id: currentPostId,
			slug: getEditedPostAttribute( 'slug' ),
			status: isEditedPostNew() ? 'draft' : getEditedPostAttribute( 'status' ),
			title: { raw: getEditedPostAttribute( 'title' ), rendered: '' },
		};

		const partitionDraftPosts: Record< string, Array< Post[] > > = items.reduce(
			( { drafts, recent }, item ) => {
				return item.status === 'draft'
					? { drafts: [ ...drafts, item ], recent }
					: { drafts, recent: [ ...recent, item ] };
			},
			{ drafts: [] as Array< Post[] >, recent: [] as Array< Post[] > }
		);

		// @TODO Not sure if this is the most optimal model
		return {
			current: [ current ],
			...partitionDraftPosts,
		} as any;
	} );
}

function usePostStatusLabels(): Record< string, string > {
	return useSelect( ( select ) => {
		const items = select( 'core' ).getEntityRecords( 'root', 'status' ) as [  ];
		return ( items || [] ).reduce(
			( acc, { name, slug } ) => ( slug === 'publish' ? acc : { ...acc, [ slug ]: name } ),
			{}
		);
	} );
}
