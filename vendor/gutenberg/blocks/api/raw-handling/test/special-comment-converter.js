/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import specialCommentConverter from '../special-comment-converter';
import { deepFilterHTML } from '../utils';

describe( 'specialCommentConverter', () => {
	it( 'should convert a single "more" comment into a basic block', () => {
		equal(
			deepFilterHTML(
				'<p><!--more--></p>',
				[ specialCommentConverter ]
			),
			'<p></p><wp-block data-block="core/more"></wp-block>'
		);
	} );
	it( 'should convert a single "nextpage" comment into a basic block', () => {
		equal(
			deepFilterHTML( '<p><!--nextpage--></p>', [ specialCommentConverter ] ),
			'<p></p><wp-block data-block="core/nextpage"></wp-block>'
		);
	} );
	it( 'should convert two comments into a block', () => {
		equal(
			deepFilterHTML(
				'<p><!--more--><!--noteaser--></p>',
				[ specialCommentConverter ]
			),
			'<p></p><wp-block data-block="core/more" data-no-teaser=""></wp-block>'
		);
	} );
	it( 'should pass custom text to the block', () => {
		equal(
			deepFilterHTML(
				'<p><!--more Read all about it!--><!--noteaser--></p>',
				[ specialCommentConverter ]
			),
			'<p></p><wp-block data-block="core/more" data-custom-text="Read all about it!" data-no-teaser=""></wp-block>'
		);
	} );
	it( 'should not break content order', () => {
		const output = deepFilterHTML(
			`<p>First paragraph.<!--more--></p>
			<p>Second paragraph</p>
			<p>Third paragraph</p>`,
			[ specialCommentConverter ]
		);
		equal(
			output,
			`<p>First paragraph.</p><wp-block data-block=\"core/more\"></wp-block>
			<p>Second paragraph</p>
			<p>Third paragraph</p>`
		);
	} );

	describe( 'when tags have been reformatted', () => {
		it( 'should parse special comments', () => {
			const output = deepFilterHTML(
				'<p><!--more--><!--noteaser--></p>',
				[ specialCommentConverter ]
			);
			equal(
				output,
				'<p></p><wp-block data-block="core/more" data-no-teaser=""></wp-block>'
			);
		} );
		it( 'should not break content order', () => {
			const output = deepFilterHTML(
				`<p>First paragraph.</p>
				<p><!--more--></p>
				<p>Second paragraph</p>
				<p>Third paragraph</p>`,
				[ specialCommentConverter ]
			);
			equal(
				output,
				`<p>First paragraph.</p>
				<p></p><wp-block data-block=\"core/more\"></wp-block>
				<p>Second paragraph</p>
				<p>Third paragraph</p>`
			);
		} );
		it( 'should not break pagination order', () => {
			const output = deepFilterHTML(
				`<p>First page.</p>
				<p><!--nextpage--></p>
				<p>Second page</p>
				<p><!--nextpage--></p>
				<p>Third page</p>`,
				[ specialCommentConverter ]
			);
			equal(
				output,
				`<p>First page.</p>
				<p></p><wp-block data-block=\"core/nextpage\"></wp-block>
				<p>Second page</p>
				<p></p><wp-block data-block=\"core/nextpage\"></wp-block>
				<p>Third page</p>`
			);
		} );
	} );
} );
