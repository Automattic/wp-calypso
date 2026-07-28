/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Count } from '../';

describe( 'Count', () => {
	test( 'should call provided as prop numberFormat function', () => {
		const numberFormatSpy = jest.fn();
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

	test( 'should not render a tooltip when `tooltipText` is omitted', async () => {
		const user = userEvent.setup();
		const { container } = render( <Count count={ 5 } /> );
		const badge = container.querySelector( '.a8c-count' ) as HTMLElement;

		await user.hover( badge );
		expect( document.querySelector( '.tooltip' ) ).not.toBeInTheDocument();
	} );

	test( 'should show the tooltip on hover when `tooltipText` is provided', async () => {
		const user = userEvent.setup();
		const { container } = render( <Count count={ 5 } tooltipText="Number of unread posts" /> );
		const badge = container.querySelector( '.a8c-count' ) as HTMLElement;
		expect( screen.queryByText( 'Number of unread posts' ) ).not.toBeInTheDocument();

		await user.hover( badge );
		expect( await screen.findByText( 'Number of unread posts' ) ).toBeVisible();

		await user.unhover( badge );
		expect( screen.queryByText( 'Number of unread posts' ) ).not.toBeInTheDocument();
	} );

	test( 'should show the tooltip on keyboard focus when focusable and `tooltipText` is provided', async () => {
		const user = userEvent.setup();
		const { container } = render(
			<Count count={ 5 } tooltipText="Number of unread posts" tabIndex={ 0 } />
		);
		const badge = container.querySelector( '.a8c-count' ) as HTMLElement;

		await user.tab();
		expect( badge ).toHaveFocus();
		expect( await screen.findByText( 'Number of unread posts' ) ).toBeVisible();

		await user.tab();
		expect( screen.queryByText( 'Number of unread posts' ) ).not.toBeInTheDocument();
	} );
} );
