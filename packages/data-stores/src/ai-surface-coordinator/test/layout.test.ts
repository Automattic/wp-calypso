import { computeLayoutVars } from '../layout';
import type { SurfaceSnapshot, Surface } from '../reconciler';

const HC_CLOSED = { present: true, shown: false, minimized: false };
const AM_CLOSED = { present: true, open: false, minimized: false, docked: false };
function snap( hc = {}, am = {} ): SurfaceSnapshot {
	return { helpCenter: { ...HC_CLOSED, ...hc }, agentsManager: { ...AM_CLOSED, ...am } };
}

describe( 'computeLayoutVars', () => {
	it( 'leaves both stack bottoms at 0 when only one bar is minimized', () => {
		const vars = computeLayoutVars( snap( { shown: true, minimized: true } ), null );
		expect( vars[ '--ai-surface-hc-stack-bottom' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-stack-bottom' ] ).toBe( '0px' );
	} );

	it( 'raises the non-most-recent bar by (barHeight + gap) when both are minimized', () => {
		const both = snap( { shown: true, minimized: true }, { open: true, minimized: true } );
		const vars = computeLayoutVars( both, 'help-center' as Surface );
		expect( vars[ '--ai-surface-hc-stack-bottom' ] ).toBe( '0px' );
		expect( vars[ '--ai-surface-am-stack-bottom' ] ).toBe( '64px' );
	} );

	it( 'sets the rail inset to the sidebar width when Agents Manager is docked', () => {
		const vars = computeLayoutVars( snap( {}, { open: true, docked: true } ), null );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( 'var(--am-sidebar-width, 350px)' );
	} );

	it( 'sets the rail inset to 0 when Agents Manager is not docked', () => {
		const vars = computeLayoutVars( snap( {}, {} ), null );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( '0px' );
	} );
} );
