/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Notice } from '../index';

describe( 'Notice', () => {
	const translate = ( string ) => string;

	test( 'should output the component', () => {
		const { container } = render( <Notice translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'notice' );
	} );

	test( 'should have dismiss button when showDismiss passed as true', () => {
		const { container } = render( <Notice showDismiss={ true } translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have dismiss button by default if isCompact is false', () => {
		const { container } = render( <Notice isCompact={ false } translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have compact look when isCompact passed as true', () => {
		const { container } = render( <Notice isCompact={ true } translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'is-compact' );
	} );

	test( 'should not have dismiss button by default if isCompact is true', () => {
		const { container } = render( <Notice isCompact={ true } translate={ translate } /> );
		expect( container.firstChild ).not.toHaveClass( 'is-dismissable' );
	} );

	test( 'should have dismiss button when showDismiss is true and isCompact is true', () => {
		const { container } = render(
			<Notice isCompact={ true } showDismiss={ true } translate={ translate } />
		);
		expect( container.firstChild ).toHaveClass( 'is-dismissable' );
	} );

	test( 'should have proper class for is-info status parameter', () => {
		const { container } = render( <Notice status="is-info" translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'is-info' );
	} );

	test( 'should have proper class for is-success status parameter', () => {
		const { container } = render( <Notice status="is-success" translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'is-success' );
	} );

	test( 'should have proper class for is-error status parameter', () => {
		const { container } = render( <Notice status="is-error" translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'is-error' );
	} );

	test( 'should have proper class for is-warning status parameter', () => {
		const { container } = render( <Notice status="is-warning" translate={ translate } /> );
		expect( container.firstChild ).toHaveClass( 'is-warning' );
	} );
} );
