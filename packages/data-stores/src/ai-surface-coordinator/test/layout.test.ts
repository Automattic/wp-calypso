import { computeLayoutVars } from '../layout';
import type { SurfaceSnapshot } from '../reconciler';

const HC_CLOSED = { present: true, shown: false, minimized: false };
const AM_CLOSED = { present: true, open: false, minimized: false, docked: false };
function snap( hc = {}, am = {} ): SurfaceSnapshot {
	return { helpCenter: { ...HC_CLOSED, ...hc }, agentsManager: { ...AM_CLOSED, ...am } };
}

const RAISED = '72px'; // MINIMIZED_BAR_HEIGHT (56) + STACK_GAP (16)

describe( 'computeLayoutVars', () => {
	it( 'lifts the open Help Center card above the Agents Manager Ask AI bar', () => {
		const vars = computeLayoutVars( snap( { shown: true }, { open: true, minimized: true } ) );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( RAISED );
		expect( vars[ '--ai-surface-am-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'lifts the open Agents Manager panel above the Help Center minimized bar', () => {
		const vars = computeLayoutVars( snap( { shown: true, minimized: true }, { open: true } ) );
		expect( vars[ '--ai-surface-am-bottom-offset' ] ).toBe( RAISED );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'applies no offset when both are minimized (handled by the shared container)', () => {
		const vars = computeLayoutVars(
			snap( { shown: true, minimized: true }, { open: true, minimized: true } )
		);
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'applies no offset when neither surface is minimized', () => {
		const vars = computeLayoutVars( snap( { shown: true }, { open: true } ) );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'applies no offset when Agents Manager is fully hidden', () => {
		const vars = computeLayoutVars( snap( { shown: true, minimized: true }, { open: false } ) );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'sets the rail inset (and no offsets) when Agents Manager is docked', () => {
		const vars = computeLayoutVars( snap( {}, { open: true, docked: true } ) );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( 'var(--am-sidebar-width, 350px)' );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'sets the rail inset to 0 when Agents Manager is not docked', () => {
		const vars = computeLayoutVars( snap( {}, {} ) );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( '0px' );
	} );
} );
