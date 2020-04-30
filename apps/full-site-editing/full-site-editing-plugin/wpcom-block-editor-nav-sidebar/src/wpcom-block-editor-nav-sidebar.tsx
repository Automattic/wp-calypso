/**
 * External dependencies
 */
import React from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import type { Page } from './store';

export default function WpcomBlockEditorNavSidebar() {
	const pages = useSelect( ( select ) => select( STORE_KEY ).getPages() );

	return (
		<div className="wpcom-block-editor-nav-sidebar__container">
			<div className="wpcom-block-editor-nav-sidebar__header-space" />
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
