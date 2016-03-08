/**
 * @fileoverview Utility for retrieving first non-sequence callee from a CallExpression node
 * @author Automattic
 * @copyright 2016 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

var assert = require( 'assert' );
var getSequenceCallee = require( '../../../lib/util/sequence-callee' );

describe( '#getSequenceCallee', function() {
	it( 'should return non-sequence callee', function() {
		var node, callee;
		node = {
			type: 'CallExpression',
			callee: {
				type: 'Identifier',
				name: 'translate'
			}
		};
		callee = getSequenceCallee( node );

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
		callee = getSequenceCallee( node );

		assert.equal( callee, node.callee.expressions[ 1 ] );
	} );
} );
