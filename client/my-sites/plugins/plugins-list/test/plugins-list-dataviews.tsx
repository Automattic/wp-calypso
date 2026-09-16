/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import PluginsListDataViews from '../plugins-list-dataviews';
import type { View } from '@wordpress/dataviews';
import type { Plugin } from 'calypso/state/plugins/installed/types';

const mockLastView = jest.fn();

jest.mock( 'calypso/components/dataviews', () => ( {
	DataViews: ( { view, header }: { view: View; header: React.ReactNode } ) => {
		mockLastView( view );
		return <div data-testid="dataviews">{ header }</div>;
	},
} ) );

jest.mock( 'calypso/components/data/query-dotorg-plugins', () => () => null );

const plugin = (
	slug: string,
	status: ( typeof PLUGINS_STATUS )[ keyof typeof PLUGINS_STATUS ][]
) => ( { slug, id: `${ slug }/${ slug }`, name: slug, sites: {}, status } ) as unknown as Plugin;

const CURRENT_PLUGINS = [
	plugin( 'jetpack', [ PLUGINS_STATUS.ACTIVE, PLUGINS_STATUS.UPDATE ] ),
	plugin( 'akismet', [ PLUGINS_STATUS.ACTIVE ] ),
];

const renderList = ( props: Partial< React.ComponentProps< typeof PluginsListDataViews > > = {} ) =>
	render(
		<Provider store={ configureStore()( {} ) }>
			<PluginsListDataViews
				pluginSlug={ null }
				currentPlugins={ CURRENT_PLUGINS }
				isLoading={ false }
				bulkActionDialog={ jest.fn() }
				{ ...props }
			/>
		</Provider>
	);

const updatesFilter = () =>
	mockLastView.mock.calls
		.at( -1 )?.[ 0 ]
		.filters?.find( ( f: { field: string } ) => f.field === 'status' );

describe( '<PluginsListDataViews>', () => {
	beforeAll( () => {
		window.matchMedia = jest.fn().mockImplementation( ( query ) => ( {
			matches: true,
			media: query,
			onchange: null,
			addListener: jest.fn(),
			removeListener: jest.fn(),
			addEventListener: jest.fn(),
			removeEventListener: jest.fn(),
		} ) );
	} );

	beforeEach( () => mockLastView.mockClear() );

	it( 'applies the update filter when arriving with initialFilterUpdates', () => {
		renderList( { initialFilterUpdates: true } );

		expect( updatesFilter() ).toEqual( {
			field: 'status',
			operator: 'isAny',
			value: [ PLUGINS_STATUS.UPDATE ],
		} );
	} );

	it( 'shows the update toggle as already pressed', () => {
		renderList( { initialFilterUpdates: true } );

		expect( screen.getByRole( 'button', { name: /Update available/ } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	} );

	it( 'applies no filter without initialFilterUpdates', () => {
		renderList();

		expect( mockLastView.mock.calls.at( -1 )?.[ 0 ].filters ).toEqual( [] );
		expect( screen.getByRole( 'button', { name: /Update available/ } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	} );
} );
