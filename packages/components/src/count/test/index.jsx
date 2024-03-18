/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { Count } from '../';

describe( 'Count', () => {
	test( 'should call provided as prop numberFormat function', () => {
		const numberFormatSpy = jest.fn();
		render( <Count count={ 23 } numberFormat={ numberFormatSpy } /> );
		expect( numberFormatSpy ).toHaveBeenCalledWith( 23 );
	} );

	test( 'should format appropriately if `compact` prop is `true`', () => {
		const { container } = render( <Count count={ 1375 } compact /> );
		expect( container.firstChild ).toHaveTextContent( '1.4K' );
	} );

	test( 'should render with primary class', () => {
		const { container } = render( <Count count={ 23 } primary numberFormat={ () => {} } /> );
		expect( container.firstChild ).toHaveClass( 'is-primary' );
	} );
} );
