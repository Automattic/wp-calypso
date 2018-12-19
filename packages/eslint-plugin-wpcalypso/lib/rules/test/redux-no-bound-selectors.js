/** @format */

/**
 * @fileoverview Disallow creation of selectors bound to Redux state
 * @author Automattic
 * @copyright 2017 Automattic. All rights reserved.
 * See LICENSE.md file in root directory for full license.
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require( '../../../lib/rules/redux-no-bound-selectors' ),
	RuleTester = require( 'eslint' ).RuleTester;

const REF = ' See wp-calypso#14024';
const BIND_ERROR_MESSAGE = "Don't bind functions within `connect`." + REF;
const FUNC_ERROR_MESSAGE = "Don't instantiate functions within `connect`." + REF;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

new RuleTester().run( 'redux-no-bound-selectors', rule, {
	valid: [
		`createSelector( function( state ) {
			return state.foos.map( function( foo ) {
				return state.bars.items[ foo ];
			} );
		}, function( state ) {
			return state.foos;
		} )`,

		`React.createClass( {
			setFoo: function( foo ) {
				this.setState( { foo: foo }, function( state ) {
					action( state.bars );
				} );
			}
		} )`,

		`var mapState = function( state ) {
			return {
				getSite: getSite.bind( null, state ),
				getFoos: function( id ) {
					return getFoos( state, id );
				}
			};
		};`,

		`var mapState = function( state ) {
			return {
				getSite: getSite.bind( null, state ),
				getFoos: function( id ) {
					return getFoos( state, id );
				}
			};
		};
		connect( mapStateToProps );
		`,

		`connect( function( state ) {
			return {
				value: state.foo.bind.bar
			};
		} )( Foo )
		`,

		'connect();',

		"connect( partialRight( mapState, 'foo' ) );",
	],

	invalid: [
		{
			code: `connect( function( state ) {
				return {
					getSite: getSite.bind( null, state )
				};
			} )( Foo )`,
			errors: [
				{
					message: BIND_ERROR_MESSAGE,
				},
			],
		},
		{
			code: `connect( function( state ) {
				return {
					getSite: bind( getSite, state )
				};
			} )( Foo )`,
			errors: [
				{
					message: BIND_ERROR_MESSAGE,
				},
			],
		},
		{
			code: `connect( function( state ) {
				return {
					getSite: partial( getSite, state )
				};
			} )( Foo )`,
			errors: [
				{
					message: BIND_ERROR_MESSAGE,
				},
			],
		},
		{
			code: `connect( function( state ) {
				return {
					getSite: partialRight( getSite, state )
				};
			} )( Foo )`,
			errors: [
				{
					message: BIND_ERROR_MESSAGE,
				},
			],
		},
		{
			code: `connect( function( state ) {
				return {
					getFoos: function( id ) {
						return getFoos( state, id );
					}
				};
			} )( Foo )`,
			errors: [
				{
					message: FUNC_ERROR_MESSAGE,
				},
			],
		},
		{
			code: `var mapState = function( state ) {
				return {
					getSite: getSite.bind( null, state ),
					getFoos: function( id ) {
						return getFoos( state, id );
					}
				};
			};
			connect( mapState );
			`,
			errors: [ { message: BIND_ERROR_MESSAGE }, { message: FUNC_ERROR_MESSAGE } ],
		},
	],
} );
