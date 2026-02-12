import { extractJsonFromModelResponse } from './extract-json';

describe( 'extractJsonFromModelResponse', () => {
	describe( 'direct JSON parsing', () => {
		it( 'parses valid JSON object', () => {
			const input = '{"key": "value"}';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				key: 'value',
			} );
		} );

		it( 'parses valid JSON array', () => {
			const input = '[1, 2, 3]';
			expect( extractJsonFromModelResponse( input ) ).toEqual( [ 1, 2, 3 ] );
		} );

		it( 'parses nested JSON', () => {
			const input = '{"suggestions": [{"label": "Test", "prompt": "A test prompt"}]}';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				suggestions: [ { label: 'Test', prompt: 'A test prompt' } ],
			} );
		} );

		it( 'parses JSON with whitespace', () => {
			const input = `{
				"key": "value",
				"nested": {
					"inner": true
				}
			}`;
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				key: 'value',
				nested: { inner: true },
			} );
		} );
	} );

	describe( 'markdown code block extraction', () => {
		it( 'extracts JSON from ```json code block', () => {
			const input = '```json\n{"key": "value"}\n```';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				key: 'value',
			} );
		} );

		it( 'extracts JSON from ``` code block without language', () => {
			const input = '```\n{"key": "value"}\n```';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				key: 'value',
			} );
		} );

		it( 'extracts JSON from code block with surrounding text', () => {
			const input = 'Here is the response:\n```json\n{"key": "value"}\n```\nThat was it.';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				key: 'value',
			} );
		} );

		it( 'handles code block with extra whitespace', () => {
			const input = '```json\n  {"key": "value"}  \n```';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				key: 'value',
			} );
		} );

		it( 'extracts multiline JSON from code block', () => {
			const input = `\`\`\`json
{
	"suggestions": [
		{"label": "Option A", "prompt": "First option"},
		{"label": "Option B", "prompt": "Second option"}
	]
}
\`\`\``;
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				suggestions: [
					{ label: 'Option A', prompt: 'First option' },
					{ label: 'Option B', prompt: 'Second option' },
				],
			} );
		} );
	} );

	describe( 'JSON object extraction from text', () => {
		it( 'extracts JSON object from surrounding text', () => {
			const input = 'Here is the data: {"key": "value"} and that is all.';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				key: 'value',
			} );
		} );

		it( 'extracts JSON when preceded by explanation', () => {
			const input = 'I will generate suggestions for you.\n{"suggestions": []}';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				suggestions: [],
			} );
		} );
	} );

	describe( 'error handling', () => {
		it( 'returns null for empty string', () => {
			expect( extractJsonFromModelResponse( '' ) ).toBeNull();
		} );

		it( 'returns null for plain text without JSON', () => {
			expect( extractJsonFromModelResponse( 'This is just plain text.' ) ).toBeNull();
		} );

		it( 'returns null for invalid JSON', () => {
			expect( extractJsonFromModelResponse( '{invalid json}' ) ).toBeNull();
		} );

		it( 'returns null for incomplete JSON', () => {
			expect( extractJsonFromModelResponse( '{"key": "value"' ) ).toBeNull();
		} );

		it( 'returns null for code block with invalid JSON', () => {
			const input = '```json\n{broken: json}\n```';
			expect( extractJsonFromModelResponse( input ) ).toBeNull();
		} );
	} );

	describe( 'edge cases', () => {
		it( 'handles JSON with special characters in strings', () => {
			const input = '{"message": "Hello\\nWorld\\t!"}';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				message: 'Hello\nWorld\t!',
			} );
		} );

		it( 'handles JSON with unicode', () => {
			const input = '{"emoji": "🎨", "text": "café"}';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				emoji: '🎨',
				text: 'café',
			} );
		} );

		it( 'handles empty JSON object', () => {
			expect( extractJsonFromModelResponse( '{}' ) ).toEqual( {} );
		} );

		it( 'handles empty JSON array', () => {
			expect( extractJsonFromModelResponse( '[]' ) ).toEqual( [] );
		} );

		it( 'prefers direct parse over extraction', () => {
			const input = '{"direct": true}';
			expect( extractJsonFromModelResponse( input ) ).toEqual( {
				direct: true,
			} );
		} );
	} );
} );
