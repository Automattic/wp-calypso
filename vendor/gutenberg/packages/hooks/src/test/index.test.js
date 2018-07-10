/* eslint-disable no-console */

/**
 * Internal dependencies
 */
import {
	createHooks,
	addAction,
	addFilter,
	removeAction,
	removeFilter,
	hasAction,
	hasFilter,
	removeAllActions,
	removeAllFilters,
	doAction,
	applyFilters,
	currentAction,
	currentFilter,
	doingAction,
	doingFilter,
	didAction,
	didFilter,
	actions,
	filters,
} from '..';

function filterA( str ) {
	return str + 'a';
}

function filterB( str ) {
	return str + 'b';
}

function filterC( str ) {
	return str + 'c';
}

function filterCRemovesSelf( str ) {
	removeFilter( 'test.filter', 'my_callback_filter_c_removes_self' );
	return str + 'b';
}

function filterRemovesB( str ) {
	removeFilter( 'test.filter', 'my_callback_filter_b' );
	return str;
}

function filterRemovesC( str ) {
	removeFilter( 'test.filter', 'my_callback_filter_c' );
	return str;
}

function actionA() {
	window.actionValue += 'a';
}

function actionB() {
	window.actionValue += 'b';
}

function actionC() {
	window.actionValue += 'c';
}

beforeEach( () => {
	window.actionValue = '';
	// Reset state in between tests (clear all callbacks, `didAction` counts,
	// etc.)  Just reseting actions and filters is not enough
	// because the internal functions have references to the original objects.
	[ actions, filters ].forEach( ( hooks ) => {
		for ( const k in hooks ) {
			if ( '__current' === k ) {
				continue;
			}

			delete hooks[ k ];
		}
	} );
} );

test( 'hooks can be instantiated', () => {
	const hooks = createHooks();

	expect( typeof hooks ).toBe( 'object' );
} );

test( 'run a filter with no callbacks', () => {
	expect( applyFilters( 'test.filter', 42 ) ).toBe( 42 );
} );

test( 'add and remove a filter', () => {
	addFilter( 'test.filter', 'my_callback', filterA );
	expect( removeAllFilters( 'test.filter' ) ).toBe( 1 );
	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'test' );
	expect( removeAllFilters( 'test.filter' ) ).toBe( 0 );
} );

test( 'add a filter and run it', () => {
	addFilter( 'test.filter', 'my_callback', filterA );
	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testa' );
} );

test( 'add 2 filters in a row and run them', () => {
	addFilter( 'test.filter', 'my_callback', filterA );
	addFilter( 'test.filter', 'my_callback', filterB );
	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testab' );
} );

test( 'remove a non-existent filter', () => {
	expect( removeFilter( 'test.filter', 'my_callback', filterA ) ).toBe( 0 );
	expect( removeAllFilters( 'test.filter' ) ).toBe( 0 );
} );

test( 'remove an invalid namespace from a filter', () => {
	expect( removeFilter( 'test.filter', 42 ) ).toBe( undefined );
	expect( console ).toHaveErroredWith(
		'The namespace must be a non-empty string.'
	);
} );

test( 'cannot add filters with non-string hook names', () => {
	addFilter( 42, 'my_callback', () => null );
	expect( console ).toHaveErroredWith(
		'The hook name must be a non-empty string.'
	);
} );

test( 'cannot add filters with empty-string hook names', () => {
	addFilter( '', 'my_callback', () => null );
	expect( console ).toHaveErroredWith(
		'The hook name must be a non-empty string.'
	);
} );

test( 'cannot add filters with empty-string namespaces', () => {
	addFilter( 'hook_name', '', () => null );
	expect( console ).toHaveErroredWith(
		'The namespace must be a non-empty string.'
	);
} );

test( 'cannot add filters with invalid namespaces', () => {
	addFilter( 'hook_name', 'invalid_%&name', () => null );
	expect( console ).toHaveErroredWith(
		'The namespace can only contain numbers, letters, dashes, periods, underscores and slashes.'
	);
} );

test( 'cannot add filters with namespaces starting with a slash', () => {
	addFilter( 'hook_name', '/invalid_name', () => null );
	expect( console ).toHaveErroredWith(
		'The namespace can only contain numbers, letters, dashes, periods, underscores and slashes.'
	);
} );

test( 'Can add filters with dashes in namespaces', () => {
	addFilter( 'hook_name', 'with-dashes', () => null );
	expect( console ).not.toHaveErrored();
} );

test( 'Can add filters with capitals in namespaces', () => {
	addFilter( 'hook_name', 'My_Name-OhNoaction', () => null );
	expect( console ).not.toHaveErrored();
} );

test( 'Can add filters with slashes in namespaces', () => {
	addFilter( 'hook_name', 'my/name/action', () => null );
	expect( console ).not.toHaveErrored();
} );

test( 'Can add filters with periods in namespaces', () => {
	addFilter( 'hook_name', 'my.name.action', () => null );
	expect( console ).not.toHaveErrored();
} );

test( 'Can add filters with capitals in hookName', () => {
	addFilter( 'hookName', 'action', () => null );
	expect( console ).not.toHaveErrored();
} );

test( 'Can add filters with periods in hookName', () => {
	addFilter( 'hook.name', 'action', () => null );
	expect( console ).not.toHaveErrored();
} );

test( 'cannot add filters with namespace containing backslash', () => {
	addFilter( 'hook_name', 'i\n\v\a\l\i\d\n\a\m\e', () => null );
	expect( console ).toHaveErroredWith(
		'The namespace can only contain numbers, letters, dashes, periods, underscores and slashes.'
	);
} );

test( 'cannot add filters named with __ prefix', () => {
	addFilter( '__test', 'my_callback', () => null );
	expect( console ).toHaveErroredWith(
		'The hook name cannot begin with `__`.'
	);
} );

test( 'cannot add filters with non-function callbacks', () => {
	addFilter( 'test', 'my_callback', '42' );
	expect( console ).toHaveErroredWith(
		'The hook callback must be a function.'
	);
} );

test( 'cannot add filters with non-numeric priorities', () => {
	addFilter( 'test', 'my_callback', () => null, '42' );
	expect( console ).toHaveErroredWith(
		'If specified, the hook priority must be a number.'
	);
} );

test( 'add 3 filters with different priorities and run them', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 2 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 8 );
	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testbca' );
} );

test( 'filters with the same and different priorities', () => {
	const callbacks = {};

	[ 1, 2, 3, 4 ].forEach( ( priority ) => {
		[ 'a', 'b', 'c', 'd' ].forEach( ( string ) => {
			callbacks[ 'fn_' + priority + string ] = ( value ) => {
				return value.concat( priority + string );
			};
		} );
	} );

	addFilter( 'test_order', 'my_callback_fn_3a', callbacks.fn_3a, 3 );
	addFilter( 'test_order', 'my_callback_fn_3b', callbacks.fn_3b, 3 );
	addFilter( 'test_order', 'my_callback_fn_3c', callbacks.fn_3c, 3 );
	addFilter( 'test_order', 'my_callback_fn_2a', callbacks.fn_2a, 2 );
	addFilter( 'test_order', 'my_callback_fn_2b', callbacks.fn_2b, 2 );
	addFilter( 'test_order', 'my_callback_fn_2c', callbacks.fn_2c, 2 );

	expect( applyFilters( 'test_order', [] ) ).toEqual(
		[ '2a', '2b', '2c', '3a', '3b', '3c' ]
	);

	removeFilter( 'test_order', 'my_callback_fn_2b', callbacks.fn_2b );
	removeFilter( 'test_order', 'my_callback_fn_3a', callbacks.fn_3a );

	expect( applyFilters( 'test_order', [] ) ).toEqual(
		[ '2a', '2c', '3b', '3c' ]
	);

	addFilter( 'test_order', 'my_callback_fn_4a', callbacks.fn_4a, 4 );
	addFilter( 'test_order', 'my_callback_fn_4b', callbacks.fn_4b, 4 );
	addFilter( 'test_order', 'my_callback_fn_1a', callbacks.fn_1a, 1 );
	addFilter( 'test_order', 'my_callback_fn_4c', callbacks.fn_4c, 4 );
	addFilter( 'test_order', 'my_callback_fn_1b', callbacks.fn_1b, 1 );
	addFilter( 'test_order', 'my_callback_fn_3d', callbacks.fn_3d, 3 );
	addFilter( 'test_order', 'my_callback_fn_4d', callbacks.fn_4d, 4 );
	addFilter( 'test_order', 'my_callback_fn_1c', callbacks.fn_1c, 1 );
	addFilter( 'test_order', 'my_callback_fn_2d', callbacks.fn_2d, 2 );
	addFilter( 'test_order', 'my_callback_fn_1d', callbacks.fn_1d, 1 );

	expect( applyFilters( 'test_order', [] ) ).toEqual( [
		// all except 2b and 3a, which we removed earlier
		'1a', '1b', '1c', '1d',
		'2a', '2c', '2d',
		'3b', '3c', '3d',
		'4a', '4b', '4c', '4d',
	] );
} );

test( 'add and remove an action', () => {
	addAction( 'test.action', 'my_callback', actionA );
	expect( removeAllActions( 'test.action' ) ).toBe( 1 );
	expect( doAction( 'test.action' ) ).toBe( undefined );
	expect( window.actionValue ).toBe( '' );
} );

test( 'add an action and run it', () => {
	addAction( 'test.action', 'my_callback', actionA );
	doAction( 'test.action' );
	expect( window.actionValue ).toBe( 'a' );
} );

test( 'add 2 actions in a row and then run them', () => {
	addAction( 'test.action', 'my_callback', actionA );
	addAction( 'test.action', 'my_callback', actionB );
	doAction( 'test.action' );
	expect( window.actionValue ).toBe( 'ab' );
} );

test( 'add 3 actions with different priorities and run them', () => {
	addAction( 'test.action', 'my_callback', actionA );
	addAction( 'test.action', 'my_callback', actionB, 2 );
	addAction( 'test.action', 'my_callback', actionC, 8 );
	doAction( 'test.action' );
	expect( window.actionValue ).toBe( 'bca' );
} );

test( 'pass in two arguments to an action', () => {
	const arg1 = { a: 10 };
	const arg2 = { b: 20 };

	addAction( 'test.action', 'my_callback', ( a, b ) => {
		expect( a ).toBe( arg1 );
		expect( b ).toBe( arg2 );
	} );
	doAction( 'test.action', arg1, arg2 );
} );

test( 'fire action multiple times', () => {
	expect.assertions( 2 );

	function func() {
		expect( true ).toBe( true );
	}

	addAction( 'test.action', 'my_callback', func );
	doAction( 'test.action' );
	doAction( 'test.action' );
} );

test( 'add a filter before the one currently executing', () => {
	addFilter( 'test.filter', 'my_callback', ( outerValue ) => {
		addFilter( 'test.filter', 'my_callback', ( innerValue ) => innerValue + 'a', 1 );
		return outerValue + 'b';
	}, 2 );

	expect( applyFilters( 'test.filter', 'test_' ) ).toBe( 'test_b' );
} );

test( 'add a filter after the one currently executing', () => {
	addFilter( 'test.filter', 'my_callback', ( outerValue ) => {
		addFilter( 'test.filter', 'my_callback', ( innerValue ) => innerValue + 'b', 2 );
		return outerValue + 'a';
	}, 1 );

	expect( applyFilters( 'test.filter', 'test_' ) ).toBe( 'test_ab' );
} );

test( 'add a filter immediately after the one currently executing', () => {
	addFilter( 'test.filter', 'my_callback', ( outerValue ) => {
		addFilter( 'test.filter', 'my_callback', ( innerValue ) => innerValue + 'b', 1 );
		return outerValue + 'a';
	}, 1 );

	expect( applyFilters( 'test.filter', 'test_' ) ).toBe( 'test_ab' );
} );

test( 'remove specific action callback', () => {
	addAction( 'test.action', 'my_callback_action_a', actionA );
	addAction( 'test.action', 'my_callback_action_b', actionB, 2 );
	addAction( 'test.action', 'my_callback_action_c', actionC, 8 );

	expect( removeAction( 'test.action', 'my_callback_action_b' ) ).toBe( 1 );
	doAction( 'test.action' );
	expect( window.actionValue ).toBe( 'ca' );
} );

test( 'remove all action callbacks', () => {
	addAction( 'test.action', 'my_callback_action_a', actionA );
	addAction( 'test.action', 'my_callback_action_b', actionB, 2 );
	addAction( 'test.action', 'my_callback_action_c', actionC, 8 );

	expect( removeAllActions( 'test.action' ) ).toBe( 3 );
	doAction( 'test.action' );
	expect( window.actionValue ).toBe( '' );
} );

test( 'remove specific filter callback', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 2 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 8 );

	expect( removeFilter( 'test.filter', 'my_callback_filter_b' ) ).toBe( 1 );
	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testca' );
} );

test( 'filter removes a callback that has already executed', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA, 1 );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 3 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 5 );
	addFilter( 'test.filter', 'my_callback_filter_removes_b', filterRemovesB, 4 );

	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testabc' );
} );

test( 'filter removes a callback that has already executed (same priority)', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA, 1 );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 2 );
	addFilter( 'test.filter', 'my_callback_filter_removes_b', filterRemovesB, 2 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 4 );

	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testabc' );
} );

test( 'filter removes the current callback', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA, 1 );
	addFilter( 'test.filter', 'my_callback_filter_c_removes_self', filterCRemovesSelf, 3 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 5 );

	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testabc' );
} );

test( 'filter removes a callback that has not yet executed (last)', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA, 1 );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 3 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 5 );
	addFilter( 'test.filter', 'my_callback_filter_removes_c', filterRemovesC, 4 );

	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testab' );
} );

test( 'filter removes a callback that has not yet executed (middle)', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA, 1 );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 3 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 4 );
	addFilter( 'test.filter', 'my_callback_filter_removes_b', filterRemovesB, 2 );

	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testac' );
} );

test( 'filter removes a callback that has not yet executed (same priority)', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA, 1 );
	addFilter( 'test.filter', 'my_callback_filter_removes_b', filterRemovesB, 2 );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 2 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 4 );

	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testac' );
} );

test( 'remove all filter callbacks', () => {
	addFilter( 'test.filter', 'my_callback_filter_a', filterA );
	addFilter( 'test.filter', 'my_callback_filter_b', filterB, 2 );
	addFilter( 'test.filter', 'my_callback_filter_c', filterC, 8 );

	expect( removeAllFilters( 'test.filter' ) ).toBe( 3 );
	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'test' );
} );

// Test doingAction, didAction, hasAction.
test( 'Test doingAction, didAction and hasAction.', () => {
	let actionCalls = 0;

	addAction( 'another.action', 'my_callback', () => {} );
	doAction( 'another.action' );

	// Verify no action is running yet.
	expect( doingAction( 'test.action' ) ).toBe( false );

	expect( didAction( 'test.action' ) ).toBe( 0 );
	expect( hasAction( 'test.action' ) ).toBe( false );

	addAction( 'test.action', 'my_callback', () => {
		actionCalls++;
		expect( currentAction() ).toBe( 'test.action' );
		expect( doingAction() ).toBe( true );
		expect( doingAction( 'test.action' ) ).toBe( true );
	} );

	// Verify action added, not running yet.
	expect( doingAction( 'test.action' ) ).toBe( false );
	expect( didAction( 'test.action' ) ).toBe( 0 );
	expect( hasAction( 'test.action' ) ).toBe( true );

	doAction( 'test.action' );

	// Verify action added and running.
	expect( actionCalls ).toBe( 1 );
	expect( doingAction( 'test.action' ) ).toBe( false );
	expect( didAction( 'test.action' ) ).toBe( 1 );
	expect( hasAction( 'test.action' ) ).toBe( true );
	expect( doingAction() ).toBe( false );
	expect( doingAction( 'test.action' ) ).toBe( false );
	expect( doingAction( 'notatest.action' ) ).toBe( false );
	expect( currentAction() ).toBe( null );

	doAction( 'test.action' );
	expect( actionCalls ).toBe( 2 );
	expect( didAction( 'test.action' ) ).toBe( 2 );

	expect( removeAllActions( 'test.action' ) ).toBe( 1 );

	// Verify state is reset appropriately.
	expect( doingAction( 'test.action' ) ).toBe( false );
	expect( didAction( 'test.action' ) ).toBe( 2 );
	expect( hasAction( 'test.action' ) ).toBe( true );

	doAction( 'another.action' );
	expect( doingAction( 'test.action' ) ).toBe( false );

	// Verify an action with no handlers is still counted
	expect( didAction( 'unattached.action' ) ).toBe( 0 );
	doAction( 'unattached.action' );
	expect( doingAction( 'unattached.action' ) ).toBe( false );
	expect( didAction( 'unattached.action' ) ).toBe( 1 );

	doAction( 'unattached.action' );
	expect( doingAction( 'unattached.action' ) ).toBe( false );
	expect( didAction( 'unattached.action' ) ).toBe( 2 );

	// Verify hasAction returns 0 when no matching action.
	expect( hasAction( 'notatest.action' ) ).toBe( false );
} );

test( 'Verify doingFilter, didFilter and hasFilter.', () => {
	let filterCalls = 0;

	addFilter( 'runtest.filter', 'my_callback', ( arg ) => {
		filterCalls++;
		expect( currentFilter() ).toBe( 'runtest.filter' );
		expect( doingFilter() ).toBe( true );
		expect( doingFilter( 'runtest.filter' ) ).toBe( true );
		return arg;
	} );

	// Verify filter added and running.
	const test = applyFilters( 'runtest.filter', 'someValue' );
	expect( test ).toBe( 'someValue' );
	expect( filterCalls ).toBe( 1 );
	expect( didFilter( 'runtest.filter' ) ).toBe( 1 );
	expect( hasFilter( 'runtest.filter' ) ).toBe( true );
	expect( hasFilter( 'notatest.filter' ) ).toBe( false );
	expect( doingFilter() ).toBe( false );
	expect( doingFilter( 'runtest.filter' ) ).toBe( false );
	expect( doingFilter( 'notatest.filter' ) ).toBe( false );
	expect( currentFilter() ).toBe( null );

	expect( removeAllFilters( 'runtest.filter' ) ).toBe( 1 );

	expect( hasFilter( 'runtest.filter' ) ).toBe( true );
	expect( didFilter( 'runtest.filter' ) ).toBe( 1 );
} );

test( 'recursively calling a filter', () => {
	addFilter( 'test.filter', 'my_callback', ( value ) => {
		if ( value.length === 7 ) {
			return value;
		}
		return applyFilters( 'test.filter', value + 'X' );
	} );

	expect( applyFilters( 'test.filter', 'test' ) ).toBe( 'testXXX' );
} );

test( 'current filter when multiple filters are running', () => {
	addFilter( 'test.filter1', 'my_callback', ( value ) => {
		return applyFilters( 'test.filter2', value.concat( currentFilter() ) );
	} );

	addFilter( 'test.filter2', 'my_callback', ( value ) => {
		return value.concat( currentFilter() );
	} );

	expect( currentFilter() ).toBe( null );

	expect( applyFilters( 'test.filter1', [ 'test' ] ) ).toEqual(
		[ 'test', 'test.filter1', 'test.filter2' ]
	);

	expect( currentFilter() ).toBe( null );
} );

test( 'adding and removing filters with recursion', () => {
	function removeRecurseAndAdd2( val ) {
		expect( removeFilter( 'remove_and_add', 'my_callback_recurse' ) ).toBe( 1 );
		val += '-' + applyFilters( 'remove_and_add', '' ) + '-';
		addFilter( 'remove_and_add', 'my_callback_recurse', removeRecurseAndAdd2, 10 );
		return val + '2';
	}

	addFilter( 'remove_and_add', 'my_callback', ( val ) => val + '1', 11 );
	addFilter( 'remove_and_add', 'my_callback_recurse', removeRecurseAndAdd2, 12 );
	addFilter( 'remove_and_add', 'my_callback', ( val ) => val + '3', 13 );
	addFilter( 'remove_and_add', 'my_callback', ( val ) => val + '4', 14 );

	expect( applyFilters( 'remove_and_add', '' ) ).toBe( '1-134-234' );
} );

test( 'actions preserve arguments across handlers without return value', () => {
	const arg1 = { a: 10 };
	const arg2 = { b: 20 };

	addAction( 'test.action', 'my_callback1', ( a, b ) => {
		expect( a ).toBe( arg1 );
		expect( b ).toBe( arg2 );
	} );

	addAction( 'test.action', 'my_callback2', ( a, b ) => {
		expect( a ).toBe( arg1 );
		expect( b ).toBe( arg2 );
	} );

	doAction( 'test.action', arg1, arg2 );
} );

test( 'filters pass first argument across handlers', () => {
	addFilter( 'test.filter', 'my_callback1', ( count ) => count + 1 );
	addFilter( 'test.filter', 'my_callback2', ( count ) => count + 1 );

	const result = applyFilters( 'test.filter', 0 );

	expect( result ).toBe( 2 );
} );

// Test adding via composition.
test( 'adding hooks via composition', () => {
	const testObject = {};
	testObject.hooks = createHooks();

	expect( typeof testObject.hooks.applyFilters ).toBe( 'function' );
} );

// Test adding as a mixin.
test( 'adding hooks as a mixin', () => {
	const testObject = {};
	Object.assign( testObject, createHooks() );

	expect( typeof testObject.applyFilters ).toBe( 'function' );
} );

// Test context.
test( 'Test `this` context via composition', () => {
	const testObject = { test: 'test this' };

	testObject.hooks = createHooks();

	const theCallback = function() {
		expect( this.test ).toBe( 'test this' );
	};
	addAction( 'test.action', 'my_callback', theCallback.bind( testObject ) );
	doAction( 'test.action' );

	const testObject2 = {};
	Object.assign( testObject2, createHooks() );
} );

const setupActionListener = ( hookName, callback ) =>
	addAction( hookName, 'my_callback', callback );

test( 'adding an action triggers a hookAdded action passing all callback details', () => {
	const hookAddedSpy = jest.fn();

	setupActionListener( 'hookAdded', hookAddedSpy );

	addAction( 'testAction', 'my_callback2', actionA, 9 );
	expect( hookAddedSpy ).toHaveBeenCalledTimes( 1 );
	expect( hookAddedSpy ).toHaveBeenCalledWith(
		'testAction',
		'my_callback2',
		actionA,
		9
	);
} );

test( 'adding a filter triggers a hookAdded action passing all callback details', () => {
	const hookAddedSpy = jest.fn();

	setupActionListener( 'hookAdded', hookAddedSpy );

	addFilter( 'testFilter', 'my_callback3', filterA, 8 );
	expect( hookAddedSpy ).toHaveBeenCalledTimes( 1 );
	expect( hookAddedSpy ).toHaveBeenCalledWith(
		'testFilter',
		'my_callback3',
		filterA,
		8
	);
} );

test( 'removing an action triggers a hookRemoved action passing all callback details', () => {
	const hookRemovedSpy = jest.fn();

	setupActionListener( 'hookRemoved', hookRemovedSpy );

	addAction( 'testAction', 'my_callback2', actionA, 9 );
	removeAction( 'testAction', 'my_callback2' );

	expect( hookRemovedSpy ).toHaveBeenCalledTimes( 1 );
	expect( hookRemovedSpy ).toHaveBeenCalledWith(
		'testAction',
		'my_callback2'
	);
} );

test( 'removing a filter triggers a hookRemoved action passing all callback details', () => {
	const hookRemovedSpy = jest.fn();

	setupActionListener( 'hookRemoved', hookRemovedSpy );

	addFilter( 'testFilter', 'my_callback3', filterA, 8 );
	removeFilter( 'testFilter', 'my_callback3' );

	expect( hookRemovedSpy ).toHaveBeenCalledTimes( 1 );
	expect( hookRemovedSpy ).toHaveBeenCalledWith(
		'testFilter',
		'my_callback3'
	);
} );
