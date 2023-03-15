import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	Button as OriginalButton,
	IsolatedEventContainer,
	withConstrainedTabbing,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { forwardRef, useLayoutEffect, useRef, useEffect } from '@wordpress/element';
import { applyFilters, doAction, hasAction } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';
import { __, isRTL } from '@wordpress/i18n';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { ESCAPE } from '@wordpress/keycodes';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { get, isEmpty, partition } from 'lodash';
import * as React from 'react';
import { POST_IDS_TO_EXCLUDE } from '../../constants';
import { store } from '../../store';
import { Post } from '../../types';
import CreatePage from '../create-page';
import NavItem from '../nav-item';
import SiteIcon from '../site-icon';

import './style.scss';

type CoreEditorPlaceholder = {
	isEditedPostNew: ( ...args: unknown[] ) => boolean;
	getCurrentPostId: ( ...args: unknown[] ) => number;
	getCurrentPostType: ( ...args: unknown[] ) => string;
	getEditedPostAttribute: ( ...args: unknown[] ) => unknown;
};
type CorePlaceholder = {
	getEntityRecords: ( ...args: unknown[] ) => Array< unknown > | null;
};

const Button = forwardRef(
	(
		{
			children,
			...rest
		}: OriginalButton.Props & { icon?: unknown; iconSize?: number; showTooltip?: boolean },
		ref
	) => (
		<OriginalButton
			ref={ ref as string | ( ( instance: HTMLElement | null ) => void ) }
			{ ...rest }
		>
			{ children }
		</OriginalButton>
	)
);

function WpcomBlockEditorNavSidebar() {
	const { toggleSidebar, setSidebarClosing } = useDispatch( store );
	const { isOpen, isClosing, postType, selectedItemId, siteTitle } = useSelect( ( select ) => {
		const { getPostType, getSite } = select( 'core' ) as unknown as {
			getPostType: ( postType: string ) => null | { slug: string };
			getSite: () => null | { title: string };
		};

		const { isSidebarOpened, isSidebarClosing } = select( store );

		return {
			isOpen: isSidebarOpened(),
			isClosing: isSidebarClosing(),
			postType: getPostType(
				( select( 'core/editor' ) as CoreEditorPlaceholder ).getCurrentPostType()
			),
			selectedItemId: ( select( 'core/editor' ) as CoreEditorPlaceholder ).getCurrentPostId(),
			siteTitle: getSite()?.title,
		};
	}, [] );

	const siteSlug = window?.location.host;

	const { current: currentPost, drafts: draftPosts, recent: recentPosts } = useNavItems();
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

	// When the sidebar closes the previously focused element should be re-focused
	const activeElementOnMount = useRef< HTMLButtonElement | null >( null );
	const dismissButtonMount = ( el: HTMLButtonElement | null ) => {
		if ( el ) {
			activeElementOnMount.current = document.activeElement as HTMLButtonElement;
			el.focus();
		}
	};
	useEffect( () => {
		if ( ! isOpen && ! isClosing && activeElementOnMount.current ) {
			activeElementOnMount.current.focus();
			activeElementOnMount.current = null;
		}
	}, [ isOpen, isClosing, activeElementOnMount ] );

	if ( ! postType ) {
		// Still loading
		return null;
	}

	if ( ! isOpen && ! isClosing ) {
		// Remove from DOM when closed so sidebar doesn't participate in tab order
		return null;
	}

	// The `closeUrl` "closes" the editor, returning the user to the dashboard.
	// It often takes the user back to the pages or posts list, but can also be overridden
	// (using the filter) to take the user to the customer homepage or themes gallery instance.
	// `closeLabel` can be overridden in the same way to correctly label where the user will
	// be taken to after closing the editor.

	let defaultCloseUrl;
	let defaultCloseLabel;

	const launchpadScreenOption = window?.wpcomBlockEditorNavSidebar?.currentSite?.launchpad_screen;
	const siteIntent = window?.wpcomBlockEditorNavSidebar?.currentSite?.site_intent;

	if ( launchpadScreenOption === 'full' && siteIntent !== false ) {
		defaultCloseUrl = `http://wordpress.com/setup/${ siteIntent }/launchpad?siteSlug=${ siteSlug }`;
		defaultCloseLabel = __( 'Next steps', 'full-site-editing' );
	} else {
		defaultCloseUrl = addQueryArgs( 'edit.php', { post_type: postType.slug } );
		defaultCloseLabel = get(
			postType,
			[ 'labels', 'all_items' ],
			__( 'Back', 'full-site-editing' )
		);
	}

	const closeUrl = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.closeUrl',
		defaultCloseUrl
	) as string;

	const closeLabel = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.closeLabel',
		defaultCloseLabel
	) as string;

	const handleClose = ( e: React.MouseEvent ) => {
		if ( hasAction( 'a8c.wpcom-block-editor.closeEditor' ) ) {
			e.preventDefault();
			recordTracksEvent( 'calypso_editor_sidebar_editor_close' );
			doAction( 'a8c.wpcom-block-editor.closeEditor' );
		}
	};

	const defaultListHeading = get( postType, [ 'labels', 'name' ] );
	const listHeading = applyFilters(
		'a8c.WpcomBlockEditorNavSidebar.listHeading',
		defaultListHeading,
		postType.slug
	) as string;

	const dialogDescription =
		postType.slug === 'page'
			? __(
					'Contains links to your dashboard or to edit other pages on your site. Press the Escape key to close.',
					'full-site-editing'
			  )
			: __(
					'Contains links to your dashboard or to edit other posts on your site. Press the Escape key to close.',
					'full-site-editing'
			  );

	const dismissSidebar = () => {
		if ( isOpen && ! isClosing ) {
			recordTracksEvent( 'calypso_editor_sidebar_dismiss' );
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
				aria-label={ __( 'Block editor sidebar', 'full-site-editing' ) }
				// Waiting for jsx-a11y version bump to support aria-description attribute
				// eslint-disable-next-line jsx-a11y/aria-props
				aria-description={ dialogDescription }
				className={ classNames( 'wpcom-block-editor-nav-sidebar-nav-sidebar__container', {
					'is-sliding-left': isClosing,
				} ) }
				role="dialog"
				tabIndex={ -1 }
			>
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__header">
					<Button
						label={ __( 'Close block editor sidebar', 'full-site-editing' ) }
						showTooltip
						ref={ dismissButtonMount }
						className={ classNames(
							'edit-post-fullscreen-mode-close',
							'wpcom-block-editor-nav-sidebar-nav-sidebar__dismiss-sidebar-button',
							'has-icon'
						) }
						onClick={ dismissSidebar }
					>
						<SiteIcon />
					</Button>
					<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__site-title">
						<h2>{ siteTitle ? decodeEntities( siteTitle ) : '' }</h2>
					</div>
				</div>
				<Button
					// Waiting for jsx-a11y version bump to support aria-description attribute
					// eslint-disable-next-line jsx-a11y/aria-props
					aria-description={ __( 'Returns to the dashboard', 'full-site-editing' ) }
					href={ closeUrl }
					className="wpcom-block-editor-nav-sidebar-nav-sidebar__home-button"
					icon={ isRTL() ? chevronRight : chevronLeft }
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
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__post-scroll-area">
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
				</div>
				<div className="wpcom-block-editor-nav-sidebar-nav-sidebar__bottom-buttons">
					<CreatePage postType={ postType } />
				</div>
			</div>
		</IsolatedEventContainer>
	);
}

export default withConstrainedTabbing( WpcomBlockEditorNavSidebar );

type NavItemRecord = {
	current: Post[];
	drafts: Post[];
	recent: Post[];
};
function useNavItems(): NavItemRecord {
	return useSelect( ( select ) => {
		const {
			isEditedPostNew,
			getCurrentPostId,
			getCurrentPostType,
			getEditedPostAttribute,
		}: CoreEditorPlaceholder = select( 'core/editor' );
		const statuses = ( select( 'core' ) as CorePlaceholder ).getEntityRecords( 'root', 'status', {
			context: 'edit',
		} ) as Array< {
			show_in_list: boolean;
			slug: string;
		} > | null;

		if ( ! statuses ) {
			return { current: [], drafts: [], recent: [] };
		}

		const statusFilter = statuses
			.filter( ( { show_in_list } ) => show_in_list )
			.map( ( { slug } ) => slug )
			.join( ',' );
		const currentPostId = getCurrentPostId();
		const currentPostType = getCurrentPostType();
		const items = ( ( select( 'core' ) as CorePlaceholder ).getEntityRecords(
			'postType',
			currentPostType,
			{
				_fields: 'id,status,title',
				exclude: [ currentPostId, ...POST_IDS_TO_EXCLUDE ],
				orderby: 'modified',
				per_page: 10,
				status: statusFilter,
			}
		) || [] ) as Post[];
		const current = {
			id: currentPostId,
			status: isEditedPostNew() ? 'draft' : getEditedPostAttribute( 'status' ),
			title: { raw: getEditedPostAttribute( 'title' ), rendered: '' },
		} as Post;
		const [ drafts, recent ] = partition( items, { status: 'draft' } );

		return { current: [ current ], drafts, recent };
	}, [] );
}

function usePostStatusLabels(): Record< string, string > {
	return useSelect( ( select ) => {
		const items = ( select( 'core' ) as CorePlaceholder ).getEntityRecords( 'root', 'status' );
		return ( ( items || [] ) as Array< { name: string; slug: string } > ).reduce(
			( acc, { name, slug } ) => ( slug === 'publish' ? acc : { ...acc, [ slug ]: name } ),
			{}
		);
	}, [] );
}
