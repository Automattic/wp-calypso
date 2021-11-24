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
	subtitle: '100 plugins',
	site: {
		plan: PLAN_FREE,
	},
	size: 6,
};

describe( 'PluginsBrowserList basic tests', () => {
	test( 'should render the section header with title', () => {
		const comp = shallow( <PluginsBrowserList { ...props } /> );
		expect( comp.find( '.plugins-browser-list__title' ).text() ).toBe( 'woocommerce' );
	} );

	test( 'should render the section header with subtitle', () => {
		const comp = shallow( <PluginsBrowserList { ...props } /> );
		expect( comp.find( '.plugins-browser-list__subtitle' ).text() ).toBe( '100 plugins' );
	} );

	test( 'should render a given number of list items when the size prop is set', () => {
		const comp = shallow( <PluginsBrowserList { ...props } size={ 2 } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)' ).length ).toBe( 2 );
	} );
} );

describe( 'InfiniteScroll variant', () => {
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

	test( 'should not show placeholders if there are plugins and the `showPlaceholders` is not set', () => {
		const comp = shallow( <PluginsBrowserList { ...infiniteScrollProps } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)' ).length ).toBe( 3 );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 0 );
	} );
} );

describe( 'Paginated variant', () => {
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

	test( 'should not show placeholders if there are plugins and the `showPlaceholders` is not set', () => {
		const comp = shallow( <PluginsBrowserList { ...paginatedProps } /> );
		expect( comp.find( 'Connect(PluginsBrowserListElement)' ).length ).toBe( 3 );
		expect( comp.find( 'Connect(PluginsBrowserListElement)[isPlaceholder]' ).length ).toBe( 0 );
	} );
} );

describe( 'Fixed variant', () => {
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
