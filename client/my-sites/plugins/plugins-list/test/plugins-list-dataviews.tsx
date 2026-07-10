/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { PLUGINS_STATUS } from 'calypso/state/plugins/installed/status/constants';
import PluginsListDataViews from '../plugins-list-dataviews';
import type { ComponentProps, ComponentType } from 'react';

jest.mock( '@automattic/viewport', () => ( {
	isDesktop: () => true,
	subscribeIsDesktop: () => () => {},
} ) );

jest.mock( 'calypso/components/data/query-dotorg-plugins', () => () => null );

jest.mock( 'calypso/components/dataviews', () => ( {
	DataViews: ( { view }: { view: { filters: unknown[] } } ) => (
		<div data-testid="filters">{ JSON.stringify( view.filters ) }</div>
	),
} ) );

jest.mock( 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies', () => () => false );

jest.mock( '../use-actions', () => ( {
	useActions: () => [],
} ) );

jest.mock( '../use-fields', () => ( {
	useFields: () => [
		{
			id: 'status',
			getValue: ( { item }: { item: { status: number[] } } ) => item.status,
			filterBy: {
				operators: [ 'isAny' ],
			},
		},
	],
} ) );

type TestProps = ComponentProps< typeof PluginsListDataViews > & {
	showOnlyUpdates: boolean;
};

const TestablePluginsListDataViews = PluginsListDataViews as ComponentType< TestProps >;

describe( 'PluginsListDataViews', () => {
	test( 'starts with the update-available filter active when requested by the route', () => {
		const store = configureStore()( {} );

		render(
			<Provider store={ store }>
				<TestablePluginsListDataViews
					pluginSlug={ null }
					currentPlugins={ [] }
					isLoading={ false }
					bulkActionDialog={ jest.fn() }
					showOnlyUpdates
				/>
			</Provider>
		);

		expect( JSON.parse( screen.getByTestId( 'filters' ).textContent || '[]' ) ).toEqual( [
			{
				field: 'status',
				operator: 'isAny',
				value: [ PLUGINS_STATUS.UPDATE ],
			},
		] );
	} );
} );
