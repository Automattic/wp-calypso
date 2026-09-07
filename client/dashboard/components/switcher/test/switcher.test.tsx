/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { render } from '../../../test-utils';
import Switcher from '../index';
import { getPlaceholderCount } from '../switcher-content';

interface Item {
	id: string;
	name: string;
}

const currentItem: Item = { id: 'current', name: 'Current item' };

const searchableFields = [ { id: 'name', getValue: ( { item }: { item: Item } ) => item.name } ];

function renderSwitcher( { items }: { items?: Item[] } ) {
	return render(
		<Switcher< Item >
			items={ items }
			value={ currentItem }
			searchableFields={ searchableFields }
			getItemUrl={ ( item ) => `/items/${ item.id }` }
			renderItem={ ( { item } ) => <Switcher.Item title={ item.name } /> }
			itemCountHint={ 3 }
			defaultOpen
		/>
	);
}

describe( '<Switcher>', () => {
	// The popover only closes on click-outside or Escape once focus has moved
	// inside it, and `focusOnMount` gives up when it finds nothing tabbable.
	// (jsdom never lays the popover out, so this asserts presence, not visibility.)
	test( 'renders a tabbable control while the items are loading', () => {
		renderSwitcher( { items: undefined } );

		expect( screen.getByRole( 'searchbox', { name: 'Search' } ) ).toBeInTheDocument();
	} );

	test( 'announces that the items are loading', () => {
		renderSwitcher( { items: undefined } );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Loading…' );
	} );

	test( 'shows the items once they load', async () => {
		renderSwitcher( { items: [ currentItem, { id: 'other', name: 'Other item' } ] } );

		expect( await screen.findByRole( 'menuitem', { name: 'Other item' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'status' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'getPlaceholderCount', () => {
	test( 'shows one row per expected item', () => {
		expect( getPlaceholderCount( 5, 10 ) ).toBe( 5 );
	} );

	test( 'never drops below a single row', () => {
		expect( getPlaceholderCount( 0, 10 ) ).toBe( 1 );
	} );

	test( 'stops at the page size, so it matches the height of the loaded list', () => {
		expect( getPlaceholderCount( 500, 10 ) ).toBe( 10 );
	} );

	test( 'falls back to a cap when the view does not paginate', () => {
		expect( getPlaceholderCount( 500, undefined ) ).toBe( 10 );
	} );
} );
