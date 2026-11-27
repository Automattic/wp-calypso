/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { Count } from '../';

describe( 'Count', () => {
	test( 'should call provided as prop numberFormat function', () => {
		const numberFormatSpy = vi.fn();
		render( <Count count={ 23 } numberFormat={ numberFormatSpy } /> );
		expect( numberFormatSpy ).toHaveBeenCalledWith( 23 );
	} );

	test( 'should render compact number formatting when `compact` is `true`', () => {
		const { container } = render( <Count count={ 1000 } compact /> );
		expect( container.firstChild ).toHaveTextContent( '1K' );
	} );

	test( 'should render with primary class', () => {
		const { container } = render( <Count count={ 23 } primary numberFormat={ () => '' } /> );
		expect( container.firstChild ).toHaveClass( 'is-primary' );
	} );
} );
