/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { FLOATING_RIGHT_CORNER_SEED } from '../../constants';
import { ResponsiveUndockContext } from '../use-agent-layout-manager/responsive-undock-context';
import useFloatingPanelProps from '../use-floating-panel-props';

let mockAgentsManagerState: {
	floatingPosition?: 'left' | 'right';
	freeDragPosition?: { x: number; y: number } | null;
	floatingSize?: { width: number; height: number } | null;
} = {};

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setFloatingPosition: jest.fn(),
		setFreeDragPosition: jest.fn(),
		setFloatingSize: jest.fn(),
	} ),
	useSelect: () => mockAgentsManagerState,
} ) );
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'automattic/agents-manager' } ) );

function render( isResponsiveUndocked: boolean, isDocked = false ) {
	return renderHook( () => useFloatingPanelProps( isDocked ), {
		wrapper: ( { children } ) => (
			<ResponsiveUndockContext.Provider value={ { isResponsiveUndocked, undockCount: 2 } }>
				{ children }
			</ResponsiveUndockContext.Provider>
		),
	} );
}

describe( 'useFloatingPanelProps', () => {
	beforeEach( () => {
		mockAgentsManagerState = {
			floatingPosition: 'left',
			freeDragPosition: { x: 10, y: -20 },
			floatingSize: { width: 500, height: 600 },
		};
	} );

	it( 'keys the container by dock state and responsive undocks', () => {
		expect( render( false, true ).result.current.containerKey ).toBe( 'embedded' );
		expect( render( false, false ).result.current.containerKey ).toBe( 'floating-2' );
	} );

	it( 'restores the persisted values by default', () => {
		const { result } = render( false );

		expect( result.current.containerProps.initialChatPosition ).toBe( 'left' );
		expect( result.current.containerProps.initialFreeDragPosition ).toEqual( { x: 10, y: -20 } );
		expect( result.current.containerProps.defaultSize ).toEqual( { width: 500, height: 600 } );
	} );

	it( 'falls back to undefined when nothing is persisted', () => {
		mockAgentsManagerState = {
			floatingPosition: 'right',
			freeDragPosition: null,
			floatingSize: null,
		};
		const { result } = render( false );

		expect( result.current.containerProps.initialFreeDragPosition ).toBeUndefined();
		expect( result.current.containerProps.defaultSize ).toBeUndefined();
	} );

	it( 'seeds the right corner at the default size on the responsive undock', () => {
		// The responsive-undock transition clears the session values.
		mockAgentsManagerState = {
			floatingPosition: 'left',
			freeDragPosition: null,
			floatingSize: null,
		};
		const { result } = render( true );

		expect( result.current.containerProps.initialChatPosition ).toBe( 'right' );
		expect( result.current.containerProps.initialFreeDragPosition ).toBe(
			FLOATING_RIGHT_CORNER_SEED
		);
		expect( result.current.containerProps.defaultSize ).toBeUndefined();
	} );

	it( 'keeps a drag/resize made while responsive-undocked across remounts', () => {
		const { result } = render( true );

		expect( result.current.containerProps.initialChatPosition ).toBe( 'left' );
		expect( result.current.containerProps.initialFreeDragPosition ).toEqual( { x: 10, y: -20 } );
		expect( result.current.containerProps.defaultSize ).toEqual( { width: 500, height: 600 } );
	} );
} );
