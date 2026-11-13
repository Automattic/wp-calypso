/**
 * @jest-environment jsdom
 */
import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import StatModuleFollowers from '..';

let mockStatsListCardProps;
jest.mock( '../../stats-list/stats-list-card', () => ( props ) => {
	mockStatsListCardProps = props;
	return null;
} );

jest.mock( '../../hooks/use-subscribers-totals-query', () => () => ( {
	data: { subscribers: [] },
	isLoading: false,
	isError: false,
} ) );

jest.mock( 'calypso/lib/subscribers/get-subscribers-url', () => ( {
	getSubscribersUrl: () => '/subscribers/example.com',
} ) );

it( 'shows subscriber management only when the selected site grants manage_options', () => {
	const initialState = {
		ui: { selectedSiteId: 123 },
		currentUser: { capabilities: { 123: { manage_options: false } } },
		sites: { items: {} },
	};
	const store = createStore( ( state = initialState, action ) => action.state ?? state );

	render(
		<Provider store={ store }>
			<StatModuleFollowers />
		</Provider>
	);

	expect( mockStatsListCardProps.showMore ).toBeUndefined();

	act( () => {
		store.dispatch( {
			type: 'SET_STATE',
			state: { ...initialState, currentUser: { capabilities: {} } },
		} );
	} );
	expect( mockStatsListCardProps.showMore ).toBeUndefined();

	const adminState = {
		...initialState,
		currentUser: {
			capabilities: { 123: { manage_options: true }, 456: { manage_options: false } },
		},
	};
	act( () => {
		store.dispatch( { type: 'SET_STATE', state: adminState } );
	} );
	expect( mockStatsListCardProps.showMore ).toEqual( {
		url: '/subscribers/example.com',
		label: 'Manage subscribers',
	} );

	act( () => {
		store.dispatch( {
			type: 'SET_STATE',
			state: { ...adminState, ui: { selectedSiteId: 456 } },
		} );
	} );
	expect( mockStatsListCardProps.showMore ).toBeUndefined();
} );
