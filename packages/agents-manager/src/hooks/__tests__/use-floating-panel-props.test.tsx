/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { ResponsiveUndockContext } from '../use-agent-layout-manager/responsive-undock-context';
import useFloatingPanelProps from '../use-floating-panel-props';

const mockSetFloatingPosition = jest.fn();
const mockSetFreeDragPosition = jest.fn();
const mockSetFloatingSize = jest.fn();

interface FloatingState {
	floatingPosition?: 'left' | 'right';
	freeDragPosition?: { x: number; y: number } | null;
	floatingSize?: { width: number; height: number } | null;
}

const PERSISTED_STATE: FloatingState = {
	floatingPosition: 'left',
	freeDragPosition: { x: 10, y: -20 },
	floatingSize: { width: 500, height: 600 },
};

let mockAgentsManagerState: FloatingState;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setFloatingPosition: mockSetFloatingPosition,
		setFreeDragPosition: mockSetFreeDragPosition,
		setFloatingSize: mockSetFloatingSize,
	} ),
	useSelect: () => mockAgentsManagerState,
} ) );
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );

// Returns the props as the chat components spread them onto `AgentUI.Container`.
function render( { isResponsiveUndocked = false, undockCount = 0 } = {} ) {
	const { result } = renderHook( () => useFloatingPanelProps(), {
		wrapper: ( { children } ) => (
			<ResponsiveUndockContext.Provider value={ { isResponsiveUndocked, undockCount } }>
				{ children }
			</ResponsiveUndockContext.Provider>
		),
	} );

	return result.current;
}

describe( 'useFloatingPanelProps', () => {
	beforeEach( () => {
		mockAgentsManagerState = { ...PERSISTED_STATE };
	} );

	// Also covers the commanded move: `agenttic-ui` reports it through these
	// handlers, so the side is saved and the panel reopens where it left off.
	it.each( [ false, true ] )(
		'reports position and size changes to the store (responsive-undocked: %s)',
		( isResponsiveUndocked ) => {
			const props = render( { isResponsiveUndocked } );

			expect( props.onChatPositionChange ).toBe( mockSetFloatingPosition );
			expect( props.onFreeDragEnd ).toBe( mockSetFreeDragPosition );
			expect( props.onResizeEnd ).toBe( mockSetFloatingSize );
		}
	);

	it( 'seeds the panel from the persisted position and size', () => {
		const props = render();

		expect( props.initialChatPosition ).toBe( 'left' );
		expect( props.initialFreeDragPosition ).toEqual( PERSISTED_STATE.freeDragPosition );
		expect( props.defaultSize ).toEqual( PERSISTED_STATE.floatingSize );
	} );

	it( 'falls back to undefined when no position or size is persisted', () => {
		mockAgentsManagerState = { floatingPosition: 'right' };
		const props = render();

		expect( props.initialFreeDragPosition ).toBeUndefined();
		expect( props.defaultSize ).toBeUndefined();
	} );

	it.each( [
		{ isResponsiveUndocked: false, side: 'left' },
		{ isResponsiveUndocked: true, side: 'right' },
	] )(
		'seeds the $side side when isResponsiveUndocked is $isResponsiveUndocked',
		( { isResponsiveUndocked, side } ) => {
			expect( render( { isResponsiveUndocked } ).initialChatPosition ).toBe( side );
		}
	);

	it( 'still seeds a drag made while responsive-undocked, so remounts keep it', () => {
		// `agenttic-ui` prefers the free-drag seed over the side.
		expect( render( { isResponsiveUndocked: true } ).initialFreeDragPosition ).toEqual(
			PERSISTED_STATE.freeDragPosition
		);
	} );

	it.each( [ 0, 3 ] )(
		'commands the right corner at the default size with id %i',
		( undockCount ) => {
			expect( render( { undockCount } ).layoutCommand ).toEqual( {
				id: undockCount,
				side: 'right',
				resetSize: true,
			} );
		}
	);
} );
