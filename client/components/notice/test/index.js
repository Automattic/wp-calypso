/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Notice } from '../index';

describe( 'Notice', () => {
	const translate = ( string ) => string;

	test( 'should output the component', () => {
		render( <Notice translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'notice' );
	} );

	test( 'should have dismiss button when showDismiss passed as true', () => {
		render( <Notice showDismiss translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have dismiss button by default if isCompact is false', () => {
		render( <Notice isCompact={ false } translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have compact look when isCompact passed as true', () => {
		render( <Notice isCompact translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-compact' );
	} );

	test( 'should not have dismiss button by default if isCompact is true', () => {
		render( <Notice isCompact translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).not.toHaveClass( 'is-dismissable' );
	} );

	test( 'should have dismiss button when showDismiss is true and isCompact is true', () => {
		render( <Notice isCompact showDismiss translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have proper class for is-info status parameter', () => {
		render( <Notice status="is-info" translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-info' );
	} );

	test( 'should have proper class for is-success status parameter', () => {
		render( <Notice status="is-success" translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-success' );
	} );

	test( 'should have proper class for is-error status parameter', () => {
		render( <Notice status="is-error" translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-error' );
	} );

	test( 'should have proper class for is-warning status parameter', () => {
		render( <Notice status="is-warning" translate={ translate } /> );
		expect( screen.queryByRole( 'status' ) ).toHaveClass( 'is-warning' );
	} );
} );
