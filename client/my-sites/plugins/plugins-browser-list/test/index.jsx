/** @jest-environment jsdom */

import { PLAN_FREE } from '@automattic/calypso-products';
import { screen } from '@testing-library/react';
import productsList from 'calypso/state/products-list/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import PluginsBrowserList from '../';
import { PluginsBrowserListVariant } from '../types';

jest.mock( 'calypso/my-sites/plugins/use-preinstalled-premium-plugin', () =>
	jest.fn( () => ( { usePreinstalledPremiumPlugin: jest.fn() } ) )
);

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { ui, productsList } } );

const plugins = [
	{ name: 'woocommerce', slug: 'woocommerce' },
	{ name: 'jetpack', slug: 'jetpack' },
	{ name: 'hello-dolly', slug: 'hello-dolly' },
];

const props = {
	plugins,
	variant: PluginsBrowserListVariant.Fixed,
	listName: 'arbitrary-plugin-list-name',
	title: 'arbitrary-plugin-list-title',
	subtitle: 'arbitrary-plugin-list-subtitle',
	site: {
		plan: PLAN_FREE,
	},
	size: 6,
};

const queryPlaceholders = () => {
	const listItems = screen.queryAllByRole( 'listitem' );
	return listItems.filter( ( item ) => item.classList.contains( 'is-placeholder' ) );
};

describe( 'PluginsBrowserList basic tests', () => {
	test( 'should render the section header with title', () => {
		render( <PluginsBrowserList { ...props } /> );
		const header = screen.getByText( props.title );
		expect( header ).toBeVisible();
		expect( header ).toHaveClass( 'plugins-results-header__title' );
	} );

	test( 'should render the section header with subtitle', () => {
		render( <PluginsBrowserList { ...props } /> );
		const subtitle = screen.getByText( props.subtitle );
		expect( subtitle ).toBeVisible();
		expect( subtitle ).toHaveClass( 'plugins-results-header__subtitle' );
	} );

	test( 'should render a given number of list items when the size prop is set', () => {
		render( <PluginsBrowserList { ...props } size={ 2 } /> );
		expect( screen.getAllByRole( 'listitem' ) ).toHaveLength( 2 );
	} );
} );

describe( 'InfiniteScroll variant', () => {
	const infiniteScrollProps = {
		...props,
		variant: PluginsBrowserListVariant.InfiniteScroll,
	};

	test( 'should show placeholders if there are no plugins', () => {
		render( <PluginsBrowserList { ...infiniteScrollProps } plugins={ [] } /> );
		expect( queryPlaceholders() ).toHaveLength( 6 );
	} );

	test( 'should append placeholders if there are plugins and `showPlaceholders` is set', () => {
		render( <PluginsBrowserList { ...infiniteScrollProps } showPlaceholders /> );
		const listItems = screen.getAllByRole( 'listitem' );
		expect( listItems ).toHaveLength( 9 );
		expect( queryPlaceholders() ).toHaveLength( 6 );
	} );

	test( 'should not show placeholders if there are plugins and the `showPlaceholders` is not set', () => {
		render( <PluginsBrowserList { ...infiniteScrollProps } /> );
		expect( queryPlaceholders() ).toHaveLength( 0 );
	} );
} );

describe( 'Paginated variant', () => {
	const paginatedProps = {
		...props,
		variant: PluginsBrowserListVariant.Paginated,
	};

	test( 'should show placeholders if there are no plugins', () => {
		render( <PluginsBrowserList { ...paginatedProps } plugins={ [] } /> );
		expect( queryPlaceholders() ).toHaveLength( 6 );
	} );

	test( 'should show placeholders if there are plugins and `showPlaceholders` is set', () => {
		render( <PluginsBrowserList { ...paginatedProps } showPlaceholders /> );
		expect( queryPlaceholders() ).toHaveLength( 6 );
	} );

	test( 'should not show placeholders if there are plugins and the `showPlaceholders` is not set', () => {
		render( <PluginsBrowserList { ...paginatedProps } /> );
		expect( queryPlaceholders() ).toHaveLength( 0 );
	} );
} );

describe( 'Fixed variant', () => {
	const fixedProps = {
		...props,
		variant: PluginsBrowserListVariant.Fixed,
	};

	test( 'should show placeholders if there are no plugins', () => {
		render( <PluginsBrowserList { ...fixedProps } plugins={ [] } /> );
		expect( queryPlaceholders() ).toHaveLength( 6 );
	} );

	describe( 'should not show placeholders regardless of the `showPlaceholders` prop', () => {
		test( 'with `showPlaceholdersProp`', () => {
			render( <PluginsBrowserList { ...fixedProps } showPlaceholders /> );
			expect( queryPlaceholders() ).toHaveLength( 0 );
		} );
		test( 'without `showPlaceholdersProp`', () => {
			render( <PluginsBrowserList { ...fixedProps } /> );
			expect( queryPlaceholders() ).toHaveLength( 0 );
		} );
	} );
} );
