/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { DataViews } from '../../components/dataviews';
import type { View } from '@wordpress/dataviews';

if ( typeof window.ResizeObserver === 'undefined' ) {
	window.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
}

type Item = { id: number; title: string };

// The list pane's height chain (style.scss) hangs infinite scrolling on
// DataViews' internal scroll container; fail loudly if an upgrade renames it.
test( 'DataViews.Layout renders the scroll container the inbox styles target', () => {
	const view: View = {
		type: 'list',
		titleField: 'title',
		fields: [],
		page: 1,
		perPage: 20,
		search: '',
		startPosition: 1,
		infiniteScrollEnabled: true,
	};

	render(
		<DataViews< Item >
			data={ [ { id: 1, title: 'Hello' } ] }
			fields={ [ { id: 'title', label: 'Title' } ] }
			view={ view }
			isLoading={ false }
			defaultLayouts={ { list: {} } }
			paginationInfo={ { totalItems: 1, totalPages: 1 } }
			getItemId={ ( item ) => String( item.id ) }
			onChangeView={ () => {} }
		>
			<DataViews.Layout />
		</DataViews>
	);

	expect( document.querySelector( '.dataviews-layout__container' ) ).not.toBeNull();
} );
