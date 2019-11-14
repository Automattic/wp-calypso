/**
 * @fileoverview Utility for retrieving callee identifier node from a CallExpression
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */
const getCallee = require( '../get-callee' );

describe( '#getCallee', () => {
	test( 'should return non-sequence callee', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'Identifier',
				name: 'translate',
			},
		};
		const callee = getCallee( node );

		expect( node.callee ).toBe( callee );
	} );

	test( 'should return first non-sequence callee expression', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'SequenceExpression',
				expressions: [
					{
						type: 'Literal',
						value: 0,
					},
					{
						type: 'Identifier',
						name: 'translate',
					},
				],
			},
		};
		const callee = getCallee( node );

		expect( node.callee.expressions[ 1 ] ).toBe( callee );
	} );

	test( 'should return first non-sequence member property', () => {
		const node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: {
					type: 'ThisExpression',
				},
				property: {
					type: 'Identifier',
					value: 'translate',
				},
			},
		};
		const callee = getCallee( node );

		expect( node.callee.property ).toBe( callee );
	} );
} );
