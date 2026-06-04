import { computeCoordination, type SurfaceSnapshot } from '../reconciler';

const HC_CLOSED = { present: true, shown: false, minimized: false };
const AM_CLOSED = { present: true, open: false, minimized: false, docked: false };

function snap(
	hc: Partial< SurfaceSnapshot[ 'helpCenter' ] >,
	am: Partial< SurfaceSnapshot[ 'agentsManager' ] >
): SurfaceSnapshot {
	return { helpCenter: { ...HC_CLOSED, ...hc }, agentsManager: { ...AM_CLOSED, ...am } };
}

describe( 'computeCoordination — no conflict', () => {
	it( 'returns no commands when neither surface is expanded', () => {
		const prev = snap( {}, {} );
		const next = snap( {}, {} );
		expect( computeCoordination( prev, next, null ) ).toEqual( {
			commands: [],
			lastExpanded: null,
		} );
	} );

	it( 'records the sole expanded floating surface as lastExpanded without minimizing anything', () => {
		const prev = snap( {}, {} );
		const next = snap( { shown: true }, {} );
		expect( computeCoordination( prev, next, null ) ).toEqual( {
			commands: [],
			lastExpanded: 'help-center',
		} );
	} );

	it( 'treats a docked Agents Manager as non-conflicting with an expanded Help Center', () => {
		const prev = snap( { shown: true }, {} );
		const next = snap( { shown: true }, { open: true, docked: true } );
		expect( computeCoordination( prev, next, 'help-center' ) ).toEqual( {
			commands: [],
			lastExpanded: 'help-center',
		} );
	} );

	it( 'no-ops entirely when a surface is not present', () => {
		const prev = snap( { shown: true }, {} );
		const next = snap( { shown: true }, { present: false, open: true } );
		expect( computeCoordination( prev, next, 'help-center' ).commands ).toEqual( [] );
	} );
} );
