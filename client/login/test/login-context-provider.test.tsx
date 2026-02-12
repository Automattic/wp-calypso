/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import LoginContextProvider, { useLoginContext } from '../login-context';

const TestConsumer = () => {
	const { headingText, subHeadingText } = useLoginContext();

	return (
		<div>
			<span data-testid="heading">{ headingText }</span>
			<span data-testid="subheading">{ subHeadingText }</span>
		</div>
	);
};

describe( 'LoginContextProvider (SSR)', () => {
	test( 'renders initial headings without relying on effects', () => {
		const html = renderToStaticMarkup(
			<LoginContextProvider initialHeading="Hello" initialSubHeading="World">
				<TestConsumer />
			</LoginContextProvider>
		);

		expect( html ).toContain( 'Hello' );
		expect( html ).toContain( 'World' );
	} );
} );

describe( 'LoginContextProvider (locale change)', () => {
	test( 'updates headings when initial values change (e.g., when locale changes)', () => {
		const { rerender } = render(
			<LoginContextProvider initialHeading="Bonjour" initialSubHeading="Le Monde">
				<TestConsumer />
			</LoginContextProvider>
		);

		expect( screen.getByTestId( 'heading' ) ).toHaveTextContent( 'Bonjour' );
		expect( screen.getByTestId( 'subheading' ) ).toHaveTextContent( 'Le Monde' );

		// Simulate locale change by re-rendering with new translations
		rerender(
			<LoginContextProvider initialHeading="Hello" initialSubHeading="World">
				<TestConsumer />
			</LoginContextProvider>
		);

		expect( screen.getByTestId( 'heading' ) ).toHaveTextContent( 'Hello' );
		expect( screen.getByTestId( 'subheading' ) ).toHaveTextContent( 'World' );
	} );
} );
