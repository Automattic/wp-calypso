/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import React from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { Button as OriginalButton } from '@wordpress/components';
import { chevronLeft, wordpress } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { get } from 'lodash';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import type { Page } from './store';

const Button = ( {
	children,
	...rest
}: OriginalButton.Props & { icon?: any; iconSize?: number } ) => (
	<OriginalButton { ...rest }>{ children }</OriginalButton>
);

export default function WpcomBlockEditorNavSidebar() {
	const [ pages, isOpen, postType ] = useSelect( ( select ) => {
		const { getCurrentPostType } = select( 'core/editor' );
		const { getPostType } = select( 'core' ) as any;

		return [
			select( STORE_KEY ).getPages(),
			select( STORE_KEY ).isSidebarOpened(),
			getPostType( getCurrentPostType() ),
		];
	} );

	const { toggleSidebar } = useDispatch( STORE_KEY );

	return (
		<div className="wpcom-block-editor-nav-sidebar__container" aria-hidden={ ! isOpen }>
			{ isOpen && (
				<div className="wpcom-block-editor-nav-sidebar__header">
					<Button
						icon={ wordpress }
						iconSize={ 36 }
						className="wpcom-block-editor-nav-sidebar__is-shrinking"
						onClick={ toggleSidebar }
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
				{ pages.map( ( page ) => (
					<PageItem key={ page.id } page={ page } />
				) ) }
			</ul>
		</div>
	);
}

interface PageItemProps {
	page: Page;
}

function PageItem( props: PageItemProps ) {
	const { slug, title } = props.page;

	return (
		<li>
			<div>{ title }</div>
			<pre>{ `/${ slug }/` }</pre>
		</li>
	);
}
