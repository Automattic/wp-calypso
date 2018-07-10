/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import isInlineContent from '../is-inline-content';

describe( 'isInlineContent', () => {
	it( 'should be inline content', () => {
		equal( isInlineContent( '<em>test</em>' ), true );
		equal( isInlineContent( '<span>test</span>' ), true );
		equal( isInlineContent( '<li>test</li>', 'ul' ), true );
	} );

	it( 'should not be inline content', () => {
		equal( isInlineContent( '<div>test</div>' ), false );
		equal( isInlineContent( '<em>test</em><div>test</div>' ), false );
		equal( isInlineContent( 'test<br><br>test' ), false );
		equal( isInlineContent( '<em><div>test</div></em>' ), false );
		equal( isInlineContent( '<li>test</li>', 'p' ), false );
		equal( isInlineContent( '<li>test</li>', 'h1' ), false );
		equal( isInlineContent( '<h1>test</h1>', 'li' ), false );
	} );
} );
