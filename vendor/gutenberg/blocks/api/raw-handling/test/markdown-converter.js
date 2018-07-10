/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import markdownConverter from '../markdown-converter';

describe( 'markdownConverter', () => {
	it( 'should correct Slack variant', () => {
		const input = '```test```';
		const output = '<pre><code>test</code></pre>';
		equal( markdownConverter( input ), output );
	} );

	it( 'should correct Slack variant on own line', () => {
		const input = 'test\n```test```\ntest';
		const output = '<p>test</p>\n<pre><code>test</code></pre>\n<p>test</p>';
		equal( markdownConverter( input ), output );
	} );

	it( 'should not correct inline code', () => {
		const input = 'test ```test``` test';
		const output = '<p>test <code>test</code> test</p>';
		equal( markdownConverter( input ), output );
	} );

	it( 'should not correct code with line breaks', () => {
		const input = '```js\ntest\n```';
		const output = '<pre><code class=\"js language-js\">test</code></pre>';
		equal( markdownConverter( input ), output );
	} );
} );
