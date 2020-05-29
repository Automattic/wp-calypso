/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button as OriginalButton } from '@wordpress/components';
import { chevronLeft, wordpress } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { applyFilters, doAction, hasAction } from '@wordpress/hooks';
import { get } from 'lodash';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';

interface Post {
	id: number;
	slug: string;
	status: string;
	title: { raw: string; rendered: string };
}

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function WpcomBlockEditorNavSidebar() {
	const [ items, isOpen, postType ] = useSelect( ( select ) => {
		const { getPostType } = select( 'core' ) as any;

		return [
			selectNavItems( select ),
			select( STORE_KEY ).isSidebarOpened(),
			getPostType( select( 'core/editor' ).getCurrentPostType() ),
		];
	} );

	const prevIsOpen = useRef( isOpen );
	const [ isClosing, setIsClosing ] = useState( false );

	useEffect( () => {
		if ( isOpen ) {
			document.body.classList.add( 'is-wpcom-block-editor-nav-sidebar-close-hidden' );
		} else if ( prevIsOpen.current ) {
			// Check previous isOpen value so we don't set isClosing on first mount
			setIsClosing( true );
		}

		prevIsOpen.current = isOpen;
	}, [ isOpen, prevIsOpen, setIsClosing ] );

	const { toggleSidebar } = useDispatch( STORE_KEY );

	let closeUrl = addQueryArgs( 'edit.php', { post_type: postType.slug } );
	closeUrl = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeUrl', closeUrl );

	let closeLabel = get( postType, [ 'labels', 'all_items' ], __( 'Back' ) );
	closeLabel = applyFilters( 'a8c.WpcomBlockEditorNavSidebar.closeLabel', closeLabel );

	const handleClose = ( e: React.WPSyntheticEvent ) => {
		if ( hasAction( 'a8c.wpcom-block-editor.closeEditor' ) ) {
			e.preventDefault();
			doAction( 'a8c.wpcom-block-editor.closeEditor' );
		}
	};

	return (
		<div className="wpcom-block-editor-nav-sidebar__container" aria-hidden={ ! isOpen }>
			{ ( isOpen || isClosing ) && (
				<div className="wpcom-block-editor-nav-sidebar__header">
					<Button
						icon={ wordpress }
						iconSize={ 36 }
						className={ classNames( {
							'wpcom-block-editor-nav-sidebar__is-shrinking': isOpen,
							'wpcom-block-editor-nav-sidebar__is-growing': isClosing,
						} ) }
						onClick={ () => {
							if ( isOpen ) {
								// The `useEffect` above already takes care of setting isClose to true,
								// but there's a flicker where isOpen and isClosing are both false for
								// a brief moment in time. Setting isClose to true here too to avoid
								// the flicker.
								setIsClosing( true );
							}
							toggleSidebar();
						} }
						onAnimationEnd={ ( ev: any ) => {
							if ( ev.animationName === 'wpcom-block-editor-nav-sidebar__grow' ) {
								setIsClosing( false );
								document.body.classList.remove( 'is-wpcom-block-editor-nav-sidebar-close-hidden' );
							}
						} }
					/>
				</div>
			) }
			<div className="wpcom-block-editor-nav-sidebar__header-space" />
			<div className="wpcom-block-editor-nav-sidebar__home-button-container">
				<Button
					href={ closeUrl }
					className="wpcom-block-editor-nav-sidebar__home-button"
					icon={ chevronLeft }
					onClick={ handleClose }
				>
					{ closeLabel }
				</Button>
			</div>
			<ul className="wpcom-block-editor-nav-sidebar__page-list">
				{ items.map( ( item ) => (
					<NavItem key={ item.id } item={ item } />
				) ) }
			</ul>
		</div>
	);
}

interface NavItemProps {
	item: Post;
}

function NavItem( { item }: NavItemProps ) {
	return (
		<li>
			<div>{ item.title.rendered }</div>
			<pre>{ `/${ item.slug }/` }</pre>
		</li>
	);
}

export function selectNavItems( select: typeof import('@wordpress/data').select ): Post[] {
	const currentPostType = select( 'core/editor' ).getCurrentPostType();

	const items = select( 'core' ).getEntityRecords( 'postType', currentPostType, {
		_fields: 'id,slug,status,title',
	} );

	return ( items as any ) || [];
}
