import { computeLayoutVars } from '../layout';
import type { SurfaceSnapshot } from '../reconciler';

const HC_CLOSED = { present: true, shown: false, minimized: false };
const AM_CLOSED = { present: true, open: false, minimized: false, docked: false };
function snap( hc = {}, am = {} ): SurfaceSnapshot {
	return { helpCenter: { ...HC_CLOSED, ...hc }, agentsManager: { ...AM_CLOSED, ...am } };
}

describe( 'computeLayoutVars', () => {
	it( "offsets Help Center up while Agents Manager's Ask AI bar is shown (open + minimized)", () => {
		const vars = computeLayoutVars( snap( { shown: true }, { open: true, minimized: true } ) );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '64px' ); // 56 + 8
	} );

	it( 'does not offset Help Center when Agents Manager is expanded (open, not minimized)', () => {
		const vars = computeLayoutVars( snap( { shown: true }, { open: true, minimized: false } ) );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'does not offset Help Center when Agents Manager is fully hidden (not open)', () => {
		const vars = computeLayoutVars( snap( { shown: true }, { open: false } ) );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'does not offset Help Center when Agents Manager is not present', () => {
		const vars = computeLayoutVars( snap( { shown: true }, { present: false } ) );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'sets the rail inset (and no bottom offset) when Agents Manager is docked', () => {
		const vars = computeLayoutVars( snap( {}, { open: true, docked: true } ) );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( 'var(--am-sidebar-width, 350px)' );
		expect( vars[ '--ai-surface-hc-bottom-offset' ] ).toBe( '0px' );
	} );

	it( 'sets the rail inset to 0 when Agents Manager is not docked', () => {
		const vars = computeLayoutVars( snap( {}, {} ) );
		expect( vars[ '--ai-surface-rail-inset' ] ).toBe( '0px' );
	} );
} );
