/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { countDiffWords, countWords } from '../';

// Adapted from TinyMCE word count tests:
// https://github.com/tinymce/tinymce/blob/4.2.6/tests/plugins/wordcount.js

describe( 'index', () => {
	describe( '#wordCount', () => {
		it( 'should return 0 for blank content', () => {
			expect( countWords(
				''
			) ).to.equal( 0 );
		} );

		it( 'should strip HTML tags and count words for a simple sentence', () => {
			expect( countWords(
				'<p>My sentence is this.</p>'
			) ).to.equal( 4 );
		} );

		it( 'should not count dashes', () => {
			expect( countWords(
				'<p>Something -- ok</p>'
			) ).to.equal( 2 );
		} );

		it( 'should not count asterisks or other non-word characters', () => {
			expect( countWords(
				'<p>* something\n\u00b7 something else</p>'
			) ).to.equal( 3 );
		} );

		it( 'should not count numbers', () => {
			expect( countWords(
				'<p>Something 123 ok</p>'
			) ).to.equal( 2 );
		} );

		it( 'should not count HTML entities', () => {
			expect( countWords(
				'<p>It&rsquo;s my life &ndash; &#8211; &#x2013; don\'t you forget.</p>'
			) ).to.equal( 6 );
		} );

		it( 'should count hyphenated words as one word', () => {
			expect( countWords(
				'<p>Hello some-word here.</p>'
			) ).to.equal( 3 );
		} );

		it( 'should count words between blocks as two words', () => {
			expect( countWords(
				'<p>Hello</p><p>world</p>'
			) ).to.equal( 2 );
		} );
	} );

	describe( '#countDiffWords', () => {
		it( 'should return (0, 0) if input is empty', () => {
			expect( countDiffWords( [] ) )
				.to.eql( {
					added: 0,
					removed: 0,
				} );
		} );

		it( 'should count words in each change', () => {
			expect( countDiffWords( [
				{
					value: 'Hello World',
					removed: true,
				},
				{
					value: 'Goodbye Continent',
					added: true,
				},
			] ) )
				.to.eql( {
					added: 2,
					removed: 2,
				} );
		} );

		it( 'should accumulate additions and deletions', () => {
			expect( countDiffWords( [
				{
					value: 'Hello',
					removed: true,
				},
				{
					value: 'Goodbye',
					added: true,
				},
				{
					value: 'World',
					removed: true,
				},
				{
					value: 'Continent',
					added: true,
				},
			] ) )
				.to.eql( {
					added: 2,
					removed: 2,
				} );
		} );
	} );
} );
