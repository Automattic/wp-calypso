/**
 * @jest-environment jsdom
 */
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useStepContainerV2Logo } from '../';
import type { ReactNode } from 'react';

const renderLogo = ( flowName: string, stepName: string, url: string ) => {
	const { result } = renderHook( () => useStepContainerV2Logo( flowName, stepName ), {
		wrapper: ( { children }: { children: ReactNode } ) => (
			<MemoryRouter initialEntries={ [ url ] }>{ children }</MemoryRouter>
		),
	} );

	return result.current;
};

describe( 'useStepContainerV2Logo', () => {
	it( 'returns the Woo logo on the Playground step with the woocommerce intent', () => {
		render(
			<>{ renderLogo( 'onboarding', 'playground', '/onboarding/playground?intent=woocommerce' ) }</>
		);

		expect( screen.getByRole( 'img', { name: 'WooCommerce' } ) ).toBeVisible();
	} );

	it( 'returns null without the woocommerce intent', () => {
		expect( renderLogo( 'onboarding', 'playground', '/onboarding/playground' ) ).toBeNull();
	} );

	it( 'returns null on other steps', () => {
		expect(
			renderLogo( 'onboarding', 'domains', '/onboarding/domains?intent=woocommerce' )
		).toBeNull();
	} );
} );
