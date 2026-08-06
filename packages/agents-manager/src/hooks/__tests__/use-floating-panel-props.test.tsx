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

function render( isResponsiveUndocked: boolean ) {
	return renderHook( () => useFloatingPanelProps(), {
		wrapper: ( { children } ) => (
			<ResponsiveUndockContext.Provider value={ isResponsiveUndocked }>
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

	it( 'restores the persisted values by default', () => {
		const { result } = render( false );

		expect( result.current.initialChatPosition ).toBe( 'left' );
		expect( result.current.initialFreeDragPosition ).toEqual( { x: 10, y: -20 } );
		expect( result.current.defaultSize ).toEqual( { width: 500, height: 600 } );
	} );

	it( 'falls back to undefined when nothing is persisted', () => {
		mockAgentsManagerState = {
			floatingPosition: 'right',
			freeDragPosition: null,
			floatingSize: null,
		};
		const { result } = render( false );

		expect( result.current.initialFreeDragPosition ).toBeUndefined();
		expect( result.current.defaultSize ).toBeUndefined();
	} );

	it( 'seeds the right corner at the default size on the responsive undock', () => {
		const { result } = render( true );

		expect( result.current.initialChatPosition ).toBe( 'right' );
		expect( result.current.initialFreeDragPosition ).toBe( FLOATING_RIGHT_CORNER_SEED );
		expect( result.current.defaultSize ).toBeUndefined();
	} );
} );
