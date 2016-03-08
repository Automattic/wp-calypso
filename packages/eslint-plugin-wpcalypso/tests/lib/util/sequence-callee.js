/**
 * @fileoverview Utility for retrieving callee identifier node from a CallExpression
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

var assert = require( 'assert' );
var getCallee = require( '../../../lib/util/get-callee' );

describe( '#getCallee', function() {
	it( 'should return non-sequence callee', function() {
		var node, callee;
		node = {
			type: 'CallExpression',
			callee: {
				type: 'Identifier',
				name: 'translate'
			}
		};
		callee = getCallee( node );

		assert.equal( callee, node.callee );
	} );

	it( 'should return first non-sequence callee expression', function() {
		var node, callee;
		node = {
			type: 'CallExpression',
			callee: {
				type: 'SequenceExpression',
				expressions: [ {
					type: 'Literal',
					value: 0
				}, {
					type: 'Identifier',
					name: 'translate'
				} ]
			}
		};
		callee = getCallee( node );

		assert.equal( callee, node.callee.expressions[ 1 ] );
	} );

	it( 'should return first non-sequence member property', function() {
		var node, callee;
		node = {
			type: 'CallExpression',
			callee: {
				type: 'MemberExpression',
				object: {
					type: 'ThisExpression'
				},
				property: {
					type: 'Identifier',
					value: 'translate'
				}
			}
		};
		callee = getCallee( node );

		assert.equal( callee, node.callee.property );
	} );
} );
