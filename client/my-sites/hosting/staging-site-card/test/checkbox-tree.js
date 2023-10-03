/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import CheckboxTree from '../checkbox-tree';

describe( 'CheckboxTree component', () => {
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
				name: 'test',
				label: 'Test',
				children: [],
			},
			{
				label: 'testWithChildren',
				children: [
					{
						name: 'testChild',
						label: 'Test Child',
						children: [],
					},
					{
						name: 'testChild2',
						label: 'Test Child 2',
						children: [],
					},
				],
			},
		];
		render( <CheckboxTree treeItems={ items } onChange={ jest.fn } /> );
		expect( screen.getByText( 'Test' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test Child' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test Child 2' ) ).toBeInTheDocument();
	} );

	it( 'disables children if parent is disabled', () => {
		const items = [
			{
				name: 'test',
				label: 'Test',
				children: [],
			},
			{
				label: 'parentWithChildren',
				children: [
					{
						name: 'testChild',
						label: 'Test Child',
						children: [],
					},
					{
						name: 'testChild2',
						label: 'Test Child 2',
						children: [],
					},
				],
			},
		];
		render( <CheckboxTree treeItems={ items } onChange={ jest.fn } /> );
		// Check parent
		const parentCheckbox = screen.getByLabelText( 'parentWithChildren' );
		expect( parentCheckbox ).toBeInTheDocument();
		expect( parentCheckbox ).not.toBeChecked();
		expect( parentCheckbox ).not.toBeDisabled();
		// Check children
		const childCheckbox = screen.getByLabelText( 'Test Child' );
		expect( childCheckbox ).toBeInTheDocument();
		expect( childCheckbox ).not.toBeChecked();
		expect( childCheckbox ).toBeDisabled();
		const childCheckbox2 = screen.getByLabelText( 'Test Child 2' );
		expect( childCheckbox2 ).toBeInTheDocument();
		expect( childCheckbox2 ).not.toBeChecked();
		expect( childCheckbox2 ).toBeDisabled();
		// Enable parent checkbox
		fireEvent.click( screen.getByText( 'parentWithChildren' ) );
		expect( parentCheckbox ).toBeChecked();

		expect( childCheckbox ).not.toBeDisabled();
		expect( childCheckbox ).not.toBeChecked();

		expect( childCheckbox2 ).not.toBeDisabled();
		expect( childCheckbox2 ).not.toBeChecked();
	} );

	it( 'provides the selected items when onChange function is provided', () => {
		const items = [
			{
				label: 'Test',
				name: 'test',
				children: [],
			},
			{
				label: 'parentWithChildren',
				children: [
					{
						name: 'testChild',
						label: 'Test Child',
						children: [],
					},
					{
						name: 'testChild2',
						label: 'Test Child 2',
						children: [],
					},
				],
			},
		];

		const onChange = jest.fn();
		render( <CheckboxTree treeItems={ items } onChange={ onChange } /> );

		fireEvent.click( screen.getByLabelText( 'parentWithChildren' ) );
		fireEvent.click( screen.getByLabelText( 'Test Child' ) );
		fireEvent.click( screen.getByText( 'Test' ) );

		// Check that the onChange function was called with the correct values
		expect( onChange ).toHaveBeenCalledTimes( 4 );
		expect( onChange ).toHaveBeenNthCalledWith( 1, [] );
		expect( onChange ).toHaveBeenNthCalledWith( 2, [
			{ checked: true, children: [], label: 'parentWithChildren' },
		] );
		expect( onChange ).toHaveBeenNthCalledWith( 3, [
			{
				checked: true,
				children: [ { checked: true, children: [], label: 'Test Child', name: 'testChild' } ],
				label: 'parentWithChildren',
			},
		] );
		expect( onChange ).toHaveBeenNthCalledWith( 4, [
			{
				checked: true,
				children: [],
				label: 'Test',
				name: 'test',
			},
			{
				checked: true,
				children: [ { checked: true, children: [], label: 'Test Child', name: 'testChild' } ],
				label: 'parentWithChildren',
			},
		] );
	} );
} );
