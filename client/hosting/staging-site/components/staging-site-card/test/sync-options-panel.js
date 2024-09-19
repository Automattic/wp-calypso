/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import SyncOptionsPanel from '../sync-options-panel';

describe( 'SyncOptionsPanel component', () => {
	beforeAll( () => {
		// Mock the missing `window.matchMedia` function that's not even in JSDOM
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation( ( query ) => ( {
				matches: false,
				media: query,
				onchange: null,
				addListener: jest.fn(), // deprecated
				removeListener: jest.fn(), // deprecated
				addEventListener: jest.fn(),
				removeEventListener: jest.fn(),
				dispatchEvent: jest.fn(),
			} ) ),
		} );
		jest.clearAllMocks();
	} );
	it( 'shows checked items correctly', () => {
		const items = [
			{
				name: 'testDangerous',
				label: 'Test Dangerous',
				checked: false,
				isDangerous: true,
			},
			{
				name: 'testDangerous2',
				label: 'Test Dangerous 2',
				checked: false,
				isDangerous: true,
			},
			{
				name: 'test2',
				label: 'Test 2',
				checked: false,
				isDangerous: false,
			},
			{
				name: 'test3',
				label: 'Test 3',
				checked: false,
				isDangerous: false,
			},
		];
		render( <SyncOptionsPanel items={ items } onChange={ jest.fn } /> );
		expect( screen.getByLabelText( 'Test Dangerous' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Test 2' ) ).toBeInTheDocument();
		expect( screen.getByLabelText( 'Test 3' ) ).toBeInTheDocument();
		expect( screen.getAllByTestId( 'danger-zone-checkbox' ) ).toHaveLength( 2 );
	} );
	it( 'shows disabled sqls item correctly', () => {
		const items = [
			{
				name: 'sqls',
				label: 'Site database',
				subTitle: 'Overwrite the database.',
				checked: false,
				isDangerous: true,
			},
		];
		render( <SyncOptionsPanel items={ items } isSqlsOptionDisabled onChange={ jest.fn } /> );
		expect( screen.getByLabelText( 'Site database' ) ).toBeInTheDocument();
		expect(
			screen.getByText(
				'Site database synchronization is disabled because WooCommerce sites are not supported.'
			)
		).toBeInTheDocument();
		expect( screen.queryByText( 'Overwrite the database.' ) ).not.toBeInTheDocument();
		expect( screen.getAllByTestId( 'danger-zone-checkbox' ) ).toHaveLength( 1 );
	} );

	it( 'provides the selected items when onChange function is provided', () => {
		const items = [
			{
				name: 'testDangerous',
				label: 'Test Dangerous',
				checked: false,
				isDangerous: true,
			},
			{
				name: 'testDangerous2',
				label: 'Test Dangerous 2',
				checked: false,
				isDangerous: true,
			},
			{
				name: 'test2',
				label: 'Test 2',
				checked: false,
				isDangerous: false,
			},
			{
				name: 'test3',
				label: 'Test 3',
				checked: false,
				isDangerous: false,
			},
		];

		const onChange = jest.fn();
		render( <SyncOptionsPanel items={ items } onChange={ onChange } /> );

		fireEvent.click( screen.getByLabelText( 'Test Dangerous' ) );
		fireEvent.click( screen.getByLabelText( 'Test Dangerous 2' ) );
		fireEvent.click( screen.getByText( 'Test 2' ) );

		// Check that the onChange function was called with the correct values
		expect( onChange ).toHaveBeenCalledTimes( 4 );
		expect( onChange ).toHaveBeenNthCalledWith( 1, [] );
		expect( onChange ).toHaveBeenNthCalledWith( 2, [
			{
				checked: true,
				isDangerous: true,
				label: 'Test Dangerous',
				name: 'testDangerous',
			},
		] );
		expect( onChange ).toHaveBeenNthCalledWith( 3, [
			{
				checked: true,
				isDangerous: true,
				label: 'Test Dangerous',
				name: 'testDangerous',
			},
			{
				checked: true,
				isDangerous: true,
				label: 'Test Dangerous 2',
				name: 'testDangerous2',
			},
		] );
		expect( onChange ).toHaveBeenNthCalledWith( 4, [
			{
				checked: true,
				isDangerous: false,
				label: 'Test 2',
				name: 'test2',
			},
			{
				checked: true,
				isDangerous: true,
				label: 'Test Dangerous',
				name: 'testDangerous',
			},
			{
				checked: true,
				isDangerous: true,
				label: 'Test Dangerous 2',
				name: 'testDangerous2',
			},
		] );
	} );
} );
