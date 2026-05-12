/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import Screen from '../index';

describe( 'Screen', () => {
	test( 'renders the heading as an h1', () => {
		render(
			<Screen heading="Log in to WordPress.com">
				<div>content</div>
			</Screen>
		);

		expect( screen.getByRole( 'heading', { level: 1 } ) ).toHaveTextContent(
			'Log in to WordPress.com'
		);
	} );

	test( 'renders the subheading when provided', () => {
		render(
			<Screen heading="Log in" subheading="By continuing…">
				<div>content</div>
			</Screen>
		);

		expect( screen.getByText( 'By continuing…' ) ).toBeVisible();
	} );

	test( 'omits the subheading when not provided', () => {
		render(
			<Screen heading="Log in">
				<div>content</div>
			</Screen>
		);

		expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
	} );

	test( 'renders an optional notice between heading and subheading', () => {
		render(
			<Screen
				heading="Log in"
				subheading="By continuing…"
				notice={ <div role="alert">Something went wrong</div> }
			>
				<div>content</div>
			</Screen>
		);

		expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Something went wrong' );
	} );

	test( 'renders an optional top-bar action', () => {
		render(
			<Screen heading="Log in" topBarAction={ <a href="/start">Create an account</a> }>
				<div>content</div>
			</Screen>
		);

		expect( screen.getByRole( 'link', { name: 'Create an account' } ) ).toBeVisible();
	} );

	test( 'renders the content children', () => {
		render(
			<Screen heading="Log in">
				<button type="button">Continue</button>
			</Screen>
		);

		expect( screen.getByRole( 'button', { name: 'Continue' } ) ).toBeVisible();
	} );
} );
