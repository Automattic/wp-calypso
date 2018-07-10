/**
 * External dependencies
 */
import { transformSync } from '@babel/core';
import traverse from '@babel/traverse';

/**
 * Internal dependencies
 */
import babelPlugin from '../src';

describe( 'babel-plugin', () => {
	const {
		getNodeAsString,
		getTranslatorComment,
		isValidTranslationKey,
		isSameTranslation,
	} = babelPlugin;

	describe( '.isValidTranslationKey()', () => {
		it( 'should return false if not one of valid keys', () => {
			expect( isValidTranslationKey( 'foo' ) ).toBe( false );
		} );

		it( 'should return true if one of valid keys', () => {
			expect( isValidTranslationKey( 'msgid' ) ).toBe( true );
		} );
	} );

	describe( '.isSameTranslation()', () => {
		it( 'should return false if any translation keys differ', () => {
			const a = { msgid: 'foo' };
			const b = { msgid: 'bar' };

			expect( isSameTranslation( a, b ) ).toBe( false );
		} );

		it( 'should return true if all translation keys the same', () => {
			const a = { msgid: 'foo', comments: { reference: 'a' } };
			const b = { msgid: 'foo', comments: { reference: 'b' } };

			expect( isSameTranslation( a, b ) ).toBe( true );
		} );
	} );

	describe( '.getTranslatorComment()', () => {
		function getCommentFromString( string ) {
			let comment;
			traverse( transformSync( string, { ast: true } ).ast, {
				CallExpression( path ) {
					comment = getTranslatorComment( path );
				},
			} );

			return comment;
		}

		it( 'should not return translator comment on same line but after call expression', () => {
			const comment = getCommentFromString( '__( \'Hello world\' ); // translators: Greeting' );

			expect( comment ).toBeUndefined();
		} );

		it( 'should return translator comment on leading comments', () => {
			const comment = getCommentFromString( '// translators: Greeting\n__( \'Hello world\' );' );

			expect( comment ).toBe( 'Greeting' );
		} );

		it( 'should be case insensitive to translator prefix', () => {
			const comment = getCommentFromString( '// TrANslAtORs: Greeting\n__( \'Hello world\' );' );

			expect( comment ).toBe( 'Greeting' );
		} );

		it( 'should traverse up parents until it encounters comment', () => {
			const comment = getCommentFromString( '// translators: Greeting\nconst string = __( \'Hello world\' );' );

			expect( comment ).toBe( 'Greeting' );
		} );

		it( 'should not consider comment if it does not end on same or previous line', () => {
			const comment = getCommentFromString( '// translators: Greeting\n\n__( \'Hello world\' );' );

			expect( comment ).toBeUndefined();
		} );

		it( 'should use multi-line comment starting many lines previous', () => {
			const comment = getCommentFromString( '/* translators: Long comment\nspanning multiple \nlines */\nconst string = __( \'Hello world\' );' );

			expect( comment ).toBe( 'Long comment spanning multiple lines' );
		} );
	} );

	describe( '.getNodeAsString()', () => {
		function getNodeAsStringFromArgument( source ) {
			let string;
			traverse( transformSync( source, { ast: true } ).ast, {
				CallExpression( path ) {
					string = getNodeAsString( path.node.arguments[ 0 ] );
				},
			} );

			return string;
		}

		it( 'should returns an empty string by default', () => {
			const string = getNodeAsStringFromArgument( '__( {} );' );

			expect( string ).toBe( '' );
		} );

		it( 'should return a string value', () => {
			const string = getNodeAsStringFromArgument( '__( "hello" );' );

			expect( string ).toBe( 'hello' );
		} );

		it( 'should be a concatenated binary expression string value', () => {
			const string = getNodeAsStringFromArgument( '__( "hello" + " world" );' );

			expect( string ).toBe( 'hello world' );
		} );
	} );
} );
