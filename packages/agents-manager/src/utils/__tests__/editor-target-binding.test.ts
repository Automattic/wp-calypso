/**
 * @jest-environment jsdom
 */
import {
	blockCurrentRequest,
	clearTargetBinding,
	getLiveTargetMove,
	getTargetViolation,
	parseEditorTarget,
	recordLiveTarget,
	recordReportedTarget,
	startNewUserRequest,
} from '../editor-target-binding';

beforeEach( () => {
	startNewUserRequest();
} );

describe( 'parseEditorTarget', () => {
	it.each( [ undefined, null, 'page:4', 42, {}, { available: 'yes' } ] )(
		'returns null for an unrecognised value: %p',
		( value ) => {
			expect( parseEditorTarget( value ) ).toBeNull();
		}
	);

	it( 'parses the no-canvas shape', () => {
		expect( parseEditorTarget( { available: false } ) ).toEqual( { available: false } );
	} );

	it( 'parses a mounting canvas', () => {
		expect( parseEditorTarget( { available: true, key: null } ) ).toEqual( {
			available: true,
			key: null,
		} );
	} );

	it( 'parses a resolved canvas with its label', () => {
		expect( parseEditorTarget( { available: true, key: 'page:4', label: 'About' } ) ).toEqual( {
			available: true,
			key: 'page:4',
			label: 'About',
		} );
	} );

	it( 'drops a non-string key rather than trusting it', () => {
		// The value crosses a repo boundary from an untyped runtime module, so a
		// wrong-typed key must degrade to "mounting" (permissive) rather than
		// being stringified into a key that matches nothing (refuses everything).
		expect( parseEditorTarget( { available: true, key: 4 } ) ).toEqual( {
			available: true,
			key: null,
		} );
	} );
} );

describe( 'getTargetViolation', () => {
	it( 'is null when the host never reported a target', () => {
		// An older Big Sky plugin against a newer Calypso. The guard disables
		// itself rather than refusing every canvas write on the site.
		recordReportedTarget( undefined );
		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'never yields a violation to block with when the host reports no target', () => {
		// The fail-open branch sits *under* the block check, so a request blocked
		// on a host that never implemented the contract would refuse every canvas
		// write over a deploy-order mismatch neither side controls.
		// `blockCurrentRequest` latches the live move rather than accepting one,
		// precisely so it cannot be reached without one — and on this host there
		// is never one to latch, however far the canvas moves.
		recordReportedTarget( undefined );
		expect( blockCurrentRequest() ).toBe( false );
		expect( getTargetViolation() ).toBeNull();

		recordLiveTarget( { available: false } );
		expect( blockCurrentRequest() ).toBe( false );
		expect( getTargetViolation() ).toBeNull();

		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );
		expect( blockCurrentRequest() ).toBe( false );
		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'is null when the canvas has not moved', () => {
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'reports no-editor when the live canvas is gone', () => {
		recordReportedTarget( { available: true, key: 'page:4' } );
		recordLiveTarget( { available: false } );
		expect( getTargetViolation() ).toEqual( { code: 'no-editor' } );
	} );

	it( 'reports no-editor when the request itself was made without a canvas', () => {
		recordReportedTarget( { available: false } );
		expect( getTargetViolation() ).toEqual( { code: 'no-editor' } );
	} );

	it( 'reports a move, naming both pages', () => {
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );
		expect( getTargetViolation() ).toEqual( {
			code: 'moved',
			from: 'About',
			to: 'Contact',
		} );
	} );

	it( 'falls back to the key when a page has no label', () => {
		recordReportedTarget( { available: true, key: 'page:4' } );
		recordLiveTarget( { available: true, key: 'page:9' } );
		expect( getTargetViolation() ).toEqual( {
			code: 'moved',
			from: 'page:4',
			to: 'page:9',
		} );
	} );

	it( 'reports a move when a canvas appears after a canvas-less request', () => {
		// The model decided what to write with no page content in front of it.
		// That output belongs to no canvas, so the one that has since mounted
		// must not receive it.
		recordReportedTarget( { available: false } );
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );
		expect( getTargetViolation() ).toEqual( {
			code: 'moved',
			from: null,
			to: 'Contact',
		} );
	} );

	it( 'lets a mounting live canvas through', () => {
		// The write abilities do their own readiness handling and retry; refusing
		// here would break ordinary editor startup.
		recordReportedTarget( { available: true, key: 'page:4' } );
		recordLiveTarget( { available: true, key: null } );
		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'lets a write through when the request was reported mid-mount', () => {
		recordReportedTarget( { available: true, key: null } );
		recordLiveTarget( { available: true, key: 'page:4' } );
		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'stays blocked for the rest of the request once the canvas has moved', () => {
		// Otherwise the model can simply retry: the refusal's own tool result
		// re-reports the new canvas, which would rebind and let the second
		// attempt write the user's request onto the page they moved to.
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );
		expect( blockCurrentRequest() ).toBe( true );

		recordReportedTarget( { available: true, key: 'page:9', label: 'Contact' } );

		// Still naming both real pages after the rebind. Re-deriving them from the
		// rebound binding would name Contact twice, so the refusal would tell the
		// user — and the model — nothing about which page the work was meant for.
		expect( getTargetViolation() ).toEqual( {
			code: 'moved',
			from: 'About',
			to: 'Contact',
		} );
	} );

	it( 'keeps the original violation code once blocked', () => {
		// A block caused by the editor closing must keep reporting `no-editor`
		// even after a canvas mounts and rebinds: the refusal message is chosen
		// from the code, and "the page you asked for is no longer open" is the
		// wrong thing to say about a request made with no page open at all.
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		recordLiveTarget( { available: false } );
		blockCurrentRequest();

		recordReportedTarget( { available: true, key: 'page:9', label: 'Contact' } );

		expect( getTargetViolation() ).toEqual( { code: 'no-editor' } );
	} );

	it( 'unblocks on the next user message', () => {
		recordReportedTarget( { available: true, key: 'page:4' } );
		recordLiveTarget( { available: true, key: 'page:9' } );
		blockCurrentRequest();
		startNewUserRequest();
		recordReportedTarget( { available: true, key: 'page:9' } );

		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'is null after the binding is cleared for an agent-driven move', () => {
		recordReportedTarget( { available: true, key: 'page:4' } );
		clearTargetBinding();
		recordLiveTarget( { available: true, key: 'page:9' } );

		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'keeps a block in place when the agent navigates mid-request', () => {
		// Only a new user message lifts a block. An agent-driven move clears the
		// binding, and if that also lifted the block the model could navigate and
		// then write the refused change onto the page it navigated to.
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );
		blockCurrentRequest();

		clearTargetBinding();

		expect( getTargetViolation() ).toEqual( {
			code: 'moved',
			from: 'About',
			to: 'Contact',
		} );
	} );
} );

describe( 'getLiveTargetMove', () => {
	it( 'stops reporting a move once the canvas is back in agreement', () => {
		// The latch-free reading, which is what the abort keys off. After a
		// refusal the model's continuation re-reports the new canvas, so the two
		// agree again — and a host event that re-announces that same canvas is not
		// a move, however long the request stays blocked.
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );
		blockCurrentRequest();

		recordReportedTarget( { available: true, key: 'page:9', label: 'Contact' } );
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );

		expect( getLiveTargetMove() ).toBeNull();
		// The block itself is untouched: the write still may not proceed.
		expect( getTargetViolation() ).toEqual( {
			code: 'moved',
			from: 'About',
			to: 'Contact',
		} );
	} );

	it( 'keeps reporting a move while the canvas is still away', () => {
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );

		expect( getLiveTargetMove() ).toEqual( {
			code: 'moved',
			from: 'About',
			to: 'Contact',
		} );
	} );
} );

describe( 'blockCurrentRequest', () => {
	it( 'latches nothing when the canvas has not moved', () => {
		// A block is only ever created from a real live move, so a caller cannot
		// refuse writes the binding has no basis to refuse.
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );

		expect( blockCurrentRequest() ).toBe( false );
		expect( getTargetViolation() ).toBeNull();
	} );

	it( 'keeps the first block rather than replacing it', () => {
		recordReportedTarget( { available: true, key: 'page:4', label: 'About' } );
		recordLiveTarget( { available: false } );
		expect( blockCurrentRequest() ).toBe( true );

		// A second call once the canvas has mounted elsewhere must not overwrite
		// the original cause — the refusal message is chosen from its code.
		recordLiveTarget( { available: true, key: 'page:9', label: 'Contact' } );
		expect( blockCurrentRequest() ).toBe( true );

		expect( getTargetViolation() ).toEqual( { code: 'no-editor' } );
	} );
} );
