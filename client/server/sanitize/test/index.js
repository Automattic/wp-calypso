/**
 * Internal dependencies
 */
import { jsonStringifyForHtml } from '..';

describe( 'jsonStringifyForHtml', () => {
	test( 'should sanitize script tags', () => {
		expect( jsonStringifyForHtml( '<script>' ) ).toBe( '"\\x3Cscript\\x3E"' );
		expect( jsonStringifyForHtml( '<Script>' ) ).toBe( '"\\x3CScript\\x3E"' );
		expect( jsonStringifyForHtml( '<SCRIPT>' ) ).toBe( '"\\x3CSCRIPT\\x3E"' );
		expect( jsonStringifyForHtml( '<ScR\u0130pT>' ) ).toBe( '"\\x3CScR\\u0130pT\\x3E"' );
	} );

	test( 'should sanitize closing script tags', () => {
		expect( jsonStringifyForHtml( '</script>' ) ).toBe( '"\\x3C\\x2Fscript\\x3E"' );
		expect( jsonStringifyForHtml( '</Script>' ) ).toBe( '"\\x3C\\x2FScript\\x3E"' );
		expect( jsonStringifyForHtml( '</SCRIPT>' ) ).toBe( '"\\x3C\\x2FSCRIPT\\x3E"' );
		expect( jsonStringifyForHtml( '</ScR\u0130pT>' ) ).toBe( '"\\x3C\\x2FScR\\u0130pT\\x3E"' );
	} );

	test( 'should sanitize HTML comment start', () => {
		expect( jsonStringifyForHtml( '<!--' ) ).toBe( '"\\x3C\\x21--"' );
	} );

	test( 'should sanitize HTML comment end', () => {
		expect( jsonStringifyForHtml( '-->' ) ).toBe( '"--\\x3E"' );
	} );

	test( 'should sanitize script tag in comment', () => {
		expect( jsonStringifyForHtml( '<!--<script>' ) ).toBe( '"\\x3C\\x21--\\x3Cscript\\x3E"' );
	} );

	test( 'should sanitize XML CDATA section start', () => {
		expect( jsonStringifyForHtml( '<![CDATA[' ) ).toBe( '"\\x3C\\x21[CDATA["' );
	} );

	test( 'should sanitize XML CDATA section end', () => {
		expect( jsonStringifyForHtml( ']]>' ) ).toBe( '"\\x5D\\x5D\\x3E"' );
	} );
} );
