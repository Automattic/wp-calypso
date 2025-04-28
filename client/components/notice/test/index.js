/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Notice from '../index';

describe( 'Notice', () => {
	test( 'should output the component', () => {
		render( <Notice /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'calypso-notice' );
	} );

	test( 'should have dismiss button when showDismiss passed as true', () => {
		render( <Notice showDismiss /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have dismiss button by default if isCompact is false', () => {
		render( <Notice isCompact={ false } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have compact look when isCompact passed as true', () => {
		render( <Notice isCompact /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-compact' );
	} );

	test( 'should not have dismiss button by default if isCompact is true', () => {
		render( <Notice isCompact /> );
		expect( screen.queryByRole( 'status' ) ).not.toHaveClass( 'is-dismissable' );
	} );

	test( 'should have dismiss button when showDismiss is true and isCompact is true', () => {
		render( <Notice isCompact showDismiss /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have proper class for is-info status parameter', () => {
		render( <Notice status="is-info" /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-info' );
	} );

	test( 'should have proper class for is-success status parameter', () => {
		render( <Notice status="is-success" /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-success' );
	} );

	test( 'should have proper class for is-error status parameter', () => {
		render( <Notice status="is-error" /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-error' );
	} );

	test( 'should have proper class for is-warning status parameter', () => {
		render( <Notice status="is-warning" /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-warning' );
	} );
} );
