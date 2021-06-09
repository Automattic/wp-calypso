/**
 * External dependencies
 */
import { renderHook } from '@testing-library/react-hooks';

/**
 * Internal dependencies
 */
import { useBodyClass } from '../use-body-class';

const classList = new Set();
const add = jest.fn( ( className ) => classList.add( className ) );
const remove = jest.fn( ( className ) => classList.delete( className ) );

// @ts-expect-error intentionally mocking `window` with an incomplete type
global.window = { document: { body: { classList: { add, remove } } } };

test( "doesn't change class list when boolean is false", () => {
	renderHook( () => useBodyClass( 'test-class', false ) );
	expect( classList ).not.toContain( 'test-class' );
} );

test( 'adds class when boolean is true', () => {
	renderHook( () => useBodyClass( 'test-class', true ) );
	expect( classList ).toContain( 'test-class' );
} );

test( 'adds class when boolean changes from false to true', () => {
	let applyClass = false;
	const { rerender } = renderHook( () => useBodyClass( 'test-class', applyClass ) );

	expect( classList ).not.toContain( 'test-class' );

	applyClass = true;
	rerender();

	expect( classList ).toContain( 'test-class' );
} );

test( 'removes class when boolean changes from true to false', () => {
	let applyClass = true;
	const { rerender } = renderHook( () => useBodyClass( 'test-class', applyClass ) );

	expect( classList ).toContain( 'test-class' );

	applyClass = false;
	rerender();

	expect( classList ).not.toContain( 'test-class' );
} );

test( 'removes old class when class name changes', () => {
	let className = 'class1';
	const { rerender } = renderHook( () => useBodyClass( className, true ) );

	expect( classList ).toContain( 'class1' );
	expect( classList ).not.toContain( 'class2' );

	className = 'class2';
	rerender();

	expect( classList ).not.toContain( 'class1' );
	expect( classList ).toContain( 'class2' );
} );

test( "doesn't add new class when boolean is always false", () => {
	let className = 'class1';
	const { rerender } = renderHook( () => useBodyClass( className, false ) );

	expect( classList ).not.toContain( 'class1' );
	expect( classList ).not.toContain( 'class2' );

	className = 'class2';
	rerender();

	expect( classList ).not.toContain( 'class1' );
	expect( classList ).not.toContain( 'class2' );
} );

test( 'add new class when class name changes _and_ boolean switches to true', () => {
	let className = 'class1';
	let applyClass = false;
	const { rerender } = renderHook( () => useBodyClass( className, applyClass ) );

	expect( classList ).not.toContain( 'class1' );
	expect( classList ).not.toContain( 'class2' );

	className = 'class2';
	applyClass = true;
	rerender();

	expect( classList ).not.toContain( 'class1' );
	expect( classList ).toContain( 'class2' );
} );

test( 'remove old class when class name changes _and_ boolean switches to false', () => {
	let className = 'class1';
	let applyClass = true;
	const { rerender } = renderHook( () => useBodyClass( className, applyClass ) );

	expect( classList ).toContain( 'class1' );
	expect( classList ).not.toContain( 'class2' );

	className = 'class2';
	applyClass = false;
	rerender();

	expect( classList ).not.toContain( 'class1' );
	expect( classList ).not.toContain( 'class2' );
} );
