/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import PlanPrice from '../index';

describe( 'PlanPrice', () => {
	it( 'renders a zero when rawPrice is passed a "0"', () => {
		render( <PlanPrice rawPrice={ 0 } /> );
		expect( document.body ).toHaveTextContent( '$0' );
	} );
	it( 'renders a rawPrice of $50', () => {
		render( <PlanPrice rawPrice={ 50 } /> );
		expect( document.body ).toHaveTextContent( '$50' );
	} );
	it( 'renders a rawPrice with a decimal', () => {
		render( <PlanPrice rawPrice={ 50.01 } /> );
		expect( document.body ).toHaveTextContent( '$50.01' );
	} );
	it( 'renders a range of prices', () => {
		render( <PlanPrice rawPrice={ [ 10, 50 ] } /> );
		expect( document.body ).toHaveTextContent( '$10-50' );
	} );
	it( 'renders a range of prices with decimals', () => {
		render( <PlanPrice rawPrice={ [ 10, 50.01 ] } /> );
		expect( document.body ).toHaveTextContent( '$10-50.01' );
	} );
	it( 'will not render a range of prices with a 0', () => {
		render( <PlanPrice rawPrice={ [ 10, 0 ] } /> );
		expect( document.body ).not.toHaveTextContent( '$10-0' );
	} );
} );
