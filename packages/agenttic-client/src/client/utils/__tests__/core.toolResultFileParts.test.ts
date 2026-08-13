import { describe, expect, it } from 'vitest';
import { createToolResultDataPart, processToolExecutionResult } from '../core';
import type { FilePart } from '../../types/index';

const screenshot: FilePart = {
	type: 'file',
	file: {
		name: 'shot.png',
		mimeType: 'image/png',
		bytes: 'aGVsbG8=',
	},
};

describe( 'createToolResultDataPart file parts', () => {
	it( 'emits `__file_parts` alongside the result when files are provided', () => {
		const part = createToolResultDataPart(
			'call-1',
			'wpcom__capture_screenshot',
			{ ok: true },
			undefined,
			[ screenshot ]
		);

		expect( part.data ).toEqual( {
			toolCallId: 'call-1',
			toolId: 'wpcom__capture_screenshot',
			result: { ok: true },
			__file_parts: [ screenshot ],
		} );
	} );

	it( 'omits the key entirely when no files are provided', () => {
		const part = createToolResultDataPart( 'call-1', 'tool', {
			ok: true,
		} );

		expect( part.data ).not.toHaveProperty( '__file_parts' );
	} );

	it( 'omits the key for an empty array so file-less payloads are unchanged', () => {
		const part = createToolResultDataPart(
			'call-1',
			'tool',
			{ ok: true },
			undefined,
			[]
		);

		expect( part.data ).not.toHaveProperty( '__file_parts' );
	} );

	it( 'carries file parts on an errored result', () => {
		const part = createToolResultDataPart(
			'call-1',
			'tool',
			undefined,
			'boom',
			[ screenshot ]
		);

		expect( part.data.__file_parts ).toEqual( [ screenshot ] );
		expect( part.metadata ).toEqual( { error: 'boom' } );
	} );
} );

describe( 'processToolExecutionResult file parts', () => {
	it( 'pulls `__file_parts` off a ToolExecutionResult', () => {
		const processed = processToolExecutionResult( {
			result: { ok: true },
			__file_parts: [ screenshot ],
		} );

		expect( processed.fileParts ).toEqual( [ screenshot ] );
		expect( processed.result ).toEqual( { ok: true } );
		expect( processed.returnToAgent ).toBe( true );
	} );

	it( 'accepts a camelCased `fileParts` from untyped tools', () => {
		const processed = processToolExecutionResult( {
			result: { ok: true },
			fileParts: [ screenshot ],
		} );

		expect( processed.fileParts ).toEqual( [ screenshot ] );
	} );

	it( 'prefers `__file_parts` when a tool sets both', () => {
		const other: FilePart = {
			type: 'file',
			file: { name: 'other.png', mimeType: 'image/png', bytes: 'eA==' },
		};

		const processed = processToolExecutionResult( {
			result: {},
			__file_parts: [ screenshot ],
			fileParts: [ other ],
		} );

		expect( processed.fileParts ).toEqual( [ screenshot ] );
	} );

	it( 'ignores a non-array value rather than forwarding garbage', () => {
		const processed = processToolExecutionResult( {
			result: {},
			__file_parts: 'not-an-array',
		} );

		expect( processed.fileParts ).toBeUndefined();
	} );

	it( 'leaves file parts undefined for results that carry none', () => {
		expect(
			processToolExecutionResult( { result: { ok: true } } ).fileParts
		).toBeUndefined();

		// Legacy direct-result format
		expect(
			processToolExecutionResult( 'plain string result' ).fileParts
		).toBeUndefined();
	} );

	it( 'preserves file parts when the tool opts out of returning to the agent', () => {
		const processed = processToolExecutionResult( {
			result: { ok: true },
			returnToAgent: false,
			__file_parts: [ screenshot ],
		} );

		expect( processed.returnToAgent ).toBe( false );
		expect( processed.fileParts ).toEqual( [ screenshot ] );
	} );
} );
