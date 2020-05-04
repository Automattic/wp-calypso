/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import React, { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button as OriginalButton } from '@wordpress/components';
import { chevronLeft, wordpress } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { get } from 'lodash';
import { addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import type { Post } from './store';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function WpcomBlockEditorNavSidebar() {
	const [ items, isOpen, postType ] = useSelect( ( select ) => {
		const { getCurrentPostType } = select( 'core/editor' );
		const { getPostType } = select( 'core' ) as any;

		return [
			select( STORE_KEY ).getNavItems(),
			select( STORE_KEY ).isSidebarOpened(),
			getPostType( getCurrentPostType() ),
		];
	} );

	const [ isClosing, setIsClosing ] = useState( false );

	useEffect( () => {
		if ( ! isOpen ) {
			setIsClosing( true );
		}
	}, [ isOpen, setIsClosing ] );

	const { toggleSidebar } = useDispatch( STORE_KEY );

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
							if ( ev.animationName === 'wpcom-block-editor-nav-sidebar__button-grow' ) {
								setIsClosing( false );
							}
						} }
					/>
				</div>
			) }
			<div className="wpcom-block-editor-nav-sidebar__header-space" />
			<div className="wpcom-block-editor-nav-sidebar__home-button-container">
				<Button
					href={ addQueryArgs( 'edit.php', {
						post_type: postType.slug,
					} ) }
					className="wpcom-block-editor-nav-sidebar__home-button"
					icon={ chevronLeft }
				>
					{ get( postType, [ 'labels', 'all_items' ], __( 'Back' ) ) }
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

function NavItem( props: NavItemProps ) {
	const { slug, title } = props.item;

	return (
		<li>
			<div>{ title }</div>
			<pre>{ `/${ slug }/` }</pre>
		</li>
	);
}
