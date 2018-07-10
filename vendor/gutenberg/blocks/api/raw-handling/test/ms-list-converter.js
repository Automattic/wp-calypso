/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import msListConverter from '../ms-list-converter';
import { deepFilterHTML } from '../utils';

describe( 'msListConverter', () => {
	it( 'should convert unordered list', () => {
		const input = '<p style="mso-list:l0 level1 lfo1"><span>* </span>test</p>';
		const output = '<ul><li>test</li></ul>';
		equal( deepFilterHTML( input, [ msListConverter ] ), output );
	} );

	it( 'should convert ordered list', () => {
		const input = '<p style="mso-list:l0 level1 lfo1"><span>1 </span>test</p>';
		const output = '<ol type="1"><li>test</li></ol>';
		equal( deepFilterHTML( input, [ msListConverter ] ), output );
	} );

	it( 'should convert indented list', () => {
		const input1 = '<p style="mso-list:l0 level1 lfo1"><span>* </span>test</p>';
		const input2 = '<p style="mso-list:l0 level2 lfo1"><span>* </span>test</p>';
		const input3 = '<p style="mso-list:l0 level1 lfo1"><span>* </span>test</p>';
		const output = '<ul><li>test<ul><li>test</li></ul></li><li>test</li></ul>';
		equal( deepFilterHTML( input1 + input2 + input3, [ msListConverter ] ), output );
	} );

	it( 'should convert deep indented list', () => {
		const input1 = '<p style="mso-list:l0 level1 lfo1"><span>* </span>test</p>';
		const input2 = '<p style="mso-list:l0 level2 lfo1"><span>* </span>test</p>';
		const input3 = '<p style="mso-list:l0 level3 lfo1"><span>* </span>test</p>';
		const input4 = '<p style="mso-list:l0 level1 lfo1"><span>* </span>test</p>';
		const output = '<ul><li>test<ul><li>test<ul><li>test</li></ul></li></ul></li><li>test</li></ul>';
		equal( deepFilterHTML( input1 + input2 + input3 + input4, [ msListConverter ] ), output );
	} );
} );
