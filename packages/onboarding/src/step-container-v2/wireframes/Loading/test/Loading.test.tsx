import { act, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Loading } from '../Loading';
import '@testing-library/jest-dom';

vi.useFakeTimers();

test( 'renders the title', () => {
	render( <Loading title="Test 123" /> );
	expect( screen.getByText( 'Test 123' ) ).toBeInTheDocument();
} );

test( 'hides title as long as delay', () => {
	render( <Loading title="Test 123" delay={ 1000 } /> );
	expect( screen.queryByText( 'Test 123' ) ).not.toBeInTheDocument();

	act( () => vi.advanceTimersByTime( 2000 ) );

	expect( screen.getByText( 'Test 123' ) ).toBeInTheDocument();
} );

test( 'dropping delay prop immediately renders title', () => {
	const { rerender } = render( <Loading title="Test 123" delay={ 1000 } /> );

	vi.advanceTimersByTime( 500 );
	expect( screen.queryByText( 'Test 123' ) ).not.toBeInTheDocument();

	rerender( <Loading title="Test 123" /> );
	expect( screen.getByText( 'Test 123' ) ).toBeInTheDocument();
} );

test( 'increasing delay prop resets timer', () => {
	const { rerender } = render( <Loading title="Test 123" delay={ 1000 } /> );

	expect( screen.queryByText( 'Test 123' ) ).not.toBeInTheDocument();

	rerender( <Loading title="Test 123" delay={ 2000 } /> );
	act( () => vi.advanceTimersByTime( 1500 ) );
	expect( screen.queryByText( 'Test 123' ) ).not.toBeInTheDocument();

	act( () => vi.advanceTimersByTime( 1000 ) );
	expect( screen.getByText( 'Test 123' ) ).toBeInTheDocument();
} );
