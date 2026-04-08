/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import PatternPicker from '../pattern-picker';

jest.mock( '../pattern-picker/item-picker', () => {
	const MockItemPicker = ( props: {
		items?: unknown[];
		clientId?: string;
		isFullLayout?: boolean;
	} ) => (
		<div
			data-testid="mock-item-picker"
			data-count={ props.items?.length ?? 0 }
			data-client-id={ props.clientId ?? '' }
			data-full-layout={ String( !! props.isFullLayout ) }
		/>
	);
	MockItemPicker.displayName = 'MockItemPicker';
	return { __esModule: true, default: MockItemPicker };
} );

jest.mock( '../../utils/create-block-recursively', () => ( {
	createBlockRecursively: jest.fn( ( data: unknown ) => Promise.resolve( data ) ),
} ) );

jest.mock( '../../hooks/use-patterns', () => ( {
	__esModule: true,
	default: () => ( {
		insertPattern: jest.fn(),
		insertPatterns: jest.fn(),
		replacePattern: jest.fn(),
	} ),
} ) );

jest.mock( '@wordpress/block-editor', () => ( { store: 'block-editor' } ) );
jest.mock( '@wordpress/data', () => ( {
	useSelect: ( cb: ( select: () => Record< string, jest.Mock > ) => unknown ) =>
		cb( () => ( { getBlock: jest.fn() } ) ),
	useDispatch: () => ( { insertBlock: jest.fn() } ),
} ) );

const makeLayout = ( id: string ) => ( {
	id,
	patterns: [ { blocks: [ { name: 'core/group', clientId: `block-${ id }` } ] } ],
} );

describe( 'PatternPicker', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'renders ItemPicker with layouts', () => {
		render( <PatternPicker layouts={ [ makeLayout( '1' ), makeLayout( '2' ) ] } /> );
		expect( screen.getByTestId( 'mock-item-picker' ) ).toHaveAttribute( 'data-count', '2' );
	} );

	it( 'passes isFullLayout prop through', () => {
		render( <PatternPicker layouts={ [ makeLayout( '1' ) ] } isFullLayout /> );
		expect( screen.getByTestId( 'mock-item-picker' ) ).toHaveAttribute(
			'data-full-layout',
			'true'
		);
	} );

	it( 'passes empty layouts to ItemPicker', () => {
		render( <PatternPicker layouts={ [] } /> );
		expect( screen.getByTestId( 'mock-item-picker' ) ).toHaveAttribute( 'data-count', '0' );
	} );
} );
