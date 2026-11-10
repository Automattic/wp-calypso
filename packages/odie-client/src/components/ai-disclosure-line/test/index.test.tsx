/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { defaultI18n, resetLocaleData, setLocaleData } from '@wordpress/i18n';
import { I18nProvider } from '@wordpress/react-i18n';
import { AiDisclosureLine } from '..';

describe( 'AiDisclosureLine', () => {
	afterEach( () => {
		resetLocaleData( undefined, 'default' );
	} );

	it( 'shows the line with the product, marked as English', () => {
		render( <AiDisclosureLine id="x" productName="WordPress.com" /> );

		const line = screen.getByText( 'You’re chatting with AI from WordPress.com Support.' );
		expect( line ).toHaveAttribute( 'id', 'x' );
		expect( line ).toHaveAttribute( 'lang', 'en' );
	} );

	it( 'marks the English line as left to right', () => {
		render( <AiDisclosureLine id="x" productName="WordPress.com" /> );

		expect(
			screen.getByText( 'You’re chatting with AI from WordPress.com Support.' )
		).toHaveAttribute( 'dir', 'ltr' );
	} );

	it( 'has no lang attribute when translated', () => {
		setLocaleData(
			{
				'You’re chatting with AI from %s Support.': [
					'Estás chateando con la IA del soporte de %s.',
				],
			},
			'default'
		);
		render( <AiDisclosureLine id="x" productName="Woo" /> );

		const line = screen.getByText( 'Estás chateando con la IA del soporte de Woo.' );
		expect( line ).not.toHaveAttribute( 'lang' );
		expect( line ).not.toHaveAttribute( 'dir' );
	} );

	it( 'updates when the translation arrives after the first render', () => {
		render(
			<I18nProvider i18n={ defaultI18n }>
				<AiDisclosureLine id="x" productName="Woo" />
			</I18nProvider>
		);
		expect( screen.getByText( 'You’re chatting with AI from Woo Support.' ) ).toBeInTheDocument();

		act( () => {
			setLocaleData(
				{
					'You’re chatting with AI from %s Support.': [
						'Estás chateando con la IA del soporte de %s.',
					],
				},
				'default'
			);
		} );

		expect(
			screen.getByText( 'Estás chateando con la IA del soporte de Woo.' )
		).toBeInTheDocument();
	} );
} );
