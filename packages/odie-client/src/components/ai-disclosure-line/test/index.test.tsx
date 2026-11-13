import { act, render, screen } from '@testing-library/react';
import { defaultI18n, resetLocaleData, setLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import '@testing-library/jest-dom/vitest';
import { AiDisclosureLine } from '..';

describe( 'AiDisclosureLine', () => {
	afterEach( () => {
		resetLocaleData( undefined, 'default' );
	} );

	it( 'shows the product’s line as is', () => {
		render(
			<AiDisclosureLine id="x" line="You’re chatting with AI from WordPress.com Support." />
		);

		expect(
			screen.getByText( 'You’re chatting with AI from WordPress.com Support.' )
		).toHaveAttribute( 'id', 'x' );
	} );

	it( 'shows the generic line without a product line', () => {
		render( <AiDisclosureLine id="x" /> );

		expect( screen.getByText( 'You’re chatting with AI.' ) ).toBeInTheDocument();
	} );

	it( 'shows the generic line when the product line is empty', () => {
		render( <AiDisclosureLine id="x" line="" /> );

		expect( screen.getByText( 'You’re chatting with AI.' ) ).toBeInTheDocument();
	} );

	it( 'updates the generic line when its translation arrives after the first render', () => {
		render(
			<I18nProvider i18n={ defaultI18n }>
				<AiDisclosureLine id="x" />
			</I18nProvider>
		);
		expect( screen.getByText( 'You’re chatting with AI.' ) ).toBeInTheDocument();

		act( () => {
			setLocaleData( { 'You’re chatting with AI.': [ 'Estás chateando con la IA.' ] }, 'default' );
		} );

		expect( screen.getByText( 'Estás chateando con la IA.' ) ).toBeInTheDocument();
	} );
} );
