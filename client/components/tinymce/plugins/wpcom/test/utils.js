/** @format */

/**
 * External dependencies
 */
import { removeEmptySpacesInParagraphs } from '../wpcom-utils';

describe( 'remove empty spaces in paragraphs', () => {
	test( 'should not modify paragraphs with content', () => {
		const content = '<p>Chicken &amp; Ribs</p>';

		expect( content ).toEqual( removeEmptySpacesInParagraphs( content ) );
	} );

	test( 'should remove &nbsp; from empty paragraphs', () => {
		const content = '<p>&nbsp;</p>';

		expect( '<p><br /></p>' ).toEqual( removeEmptySpacesInParagraphs( content ) );
	} );

	test( 'should not remove &nbsp; from paragraphs with content', () => {
		const content = '<p>chicken&nbsp;ribs</p>';

		expect( content ).toEqual( removeEmptySpacesInParagraphs( content ) );
	} );

	test( 'should remove &nbsp; from paragraphs without content and not ones with content', () => {
		const content = '<div>&nbsp;</div><p>&nbsp;</p><p>chicken&nbsp;ribs</p>';

		expect( '<div>&nbsp;</div><p><br /></p><p>chicken&nbsp;ribs</p>' ).toEqual(
			removeEmptySpacesInParagraphs( content )
		);
	} );

	test( 'should remove unicode spaces from empty paragraphs', () => {
		const content = '<p>\u00a0\ufeff\ufeff\ufeff</p>';
		expect( '<p><br /></p>' ).toEqual( removeEmptySpacesInParagraphs( content ) );
	} );

	test( 'should note remove unicode spaces from paragraphs with content', () => {
		const content = '<p>chicken\u00a0ribs</p>';
		expect( content ).toEqual( removeEmptySpacesInParagraphs( content ) );
	} );
} );
