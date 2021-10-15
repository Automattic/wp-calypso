/** @jest-environment jsdom */

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'i18n-calypso', () => ( {
	localize: ( c ) => c,
	translate: ( s ) => s,
} ) );

import { PLAN_FREE } from '@automattic/calypso-products';
import { shallow } from 'enzyme';
import PluginsBrowserList from '../';
import { PluginsBrowserListVariant } from '../types';

const plugins = [
	{ name: 'woocommerce', slug: 'woocommerce' },
	{ name: 'jetpack', slug: 'jetpack' },
	{ name: 'hello-dolly', slug: 'hello-dolly' },
];

const props = {
	plugins,
	listName: 'woocommerce',
	title: 'woocommerce',
	site: {
		plan: PLAN_FREE,
	},
	size: 6,
};

describe( 'PluginsBrowserList basic tests', () => {
	test( 'should render the section header', () => {
		const comp = shallow( <PluginsBrowserList { ...props } /> );
		expect( comp.find( 'SectionHeader[label="woocommerce"]' ).length ).toBe( 1 );
	} );

	test( 'should render a given number of list items when the size prop is set', () => {
		const comp = shallow( <PluginsBrowserList { ...props } size={ 2 } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)' ).length ).toBe( 2 );
	} );

	test( 'should render empty elements to complete the grid', () => {
		const comp = shallow( <PluginsBrowserList { ...props } plugins={ plugins.slice( 0, 2 ) } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)' ).length ).toBe( 2 );
		expect( comp.find( '.plugins-browser-item.is-empty' ).length ).toBe( 4 );
	} );
} );

describe( 'infinite scroll variant', () => {
	const infiniteScrollProps = {
		...props,
		variant: PluginsBrowserListVariant.InfiniteScroll,
	};

	test( 'should show placeholders if there are no plugins', () => {
		const comp = shallow( <PluginsBrowserList { ...infiniteScrollProps } plugins={ [] } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 6 );
	} );

	test( 'should append placeholders if there are plugins and `showPlaceholders` is set', () => {
		const comp = shallow( <PluginsBrowserList { ...infiniteScrollProps } showPlaceholders /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)' ).length ).toBe( 9 );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 6 );
	} );
} );

describe( 'paginated variant', () => {
	const paginatedProps = {
		...props,
		variant: PluginsBrowserListVariant.Paginated,
	};

	test( 'should show placeholders if there are no plugins', () => {
		const comp = shallow( <PluginsBrowserList { ...paginatedProps } plugins={ [] } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 6 );
	} );

	test( 'should show placeholders if there are plugins and `showPlaceholders` is set', () => {
		const comp = shallow( <PluginsBrowserList { ...paginatedProps } showPlaceholders /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 6 );
	} );
} );

describe( 'fixed variant', () => {
	const fixedProps = {
		...props,
		variant: PluginsBrowserListVariant.Fixed,
	};

	test( 'should show placeholders if there are no plugins', () => {
		const comp = shallow( <PluginsBrowserList { ...fixedProps } plugins={ [] } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 6 );
	} );

	test( 'should not show placeholders regardless of the `showPlaceholders` prop', () => {
		let comp = shallow( <PluginsBrowserList { ...fixedProps } showPlaceholders /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 0 );

		comp = shallow( <PluginsBrowserList { ...fixedProps } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 0 );
	} );
} );

test.todo( 'paginated prop' );
test.todo( 'showPlaceholders prop' );
