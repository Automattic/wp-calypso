/**
 * @jest-environment jsdom
 */
import {
	blockCurrentRequest,
	clearTargetBinding,
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
		blockCurrentRequest();

		recordReportedTarget( { available: true, key: 'page:9', label: 'Contact' } );

		expect( getTargetViolation() ).toEqual( {
			code: 'moved',
			from: 'Contact',
			to: 'Contact',
		} );
	} );

	it( 'unblocks on the next user message', () => {
		recordReportedTarget( { available: true, key: 'page:4' } );
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
} );
