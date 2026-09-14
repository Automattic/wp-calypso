/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import RecommendedSections from '../recommended-sections';

jest.mock( '../theme-section', () => {
	return {
		__esModule: true,
		default: ( {
			title,
			seeAllUrl,
			variant,
			sectionSlug,
		}: {
			title: string;
			seeAllUrl: string;
			variant?: string;
			sectionSlug: string;
		} ) => (
			<div
				data-testid={ `theme-section-${ sectionSlug }` }
				data-variant={ variant ?? 'light' }
				data-see-all-url={ seeAllUrl }
			>
				{ title }
			</div>
		),
	};
} );

jest.mock( '../../banners-modern/ai-builder-banner', () => {
	return {
		__esModule: true,
		default: () => <div data-testid="ai-builder-banner">AI Builder Banner</div>,
	};
} );

jest.mock( '../../banners-modern/difm-banner', () => {
	return {
		__esModule: true,
		default: () => <div data-testid="difm-banner">DIFM Banner</div>,
	};
} );

const defaultProps = {
	getActionLabel: jest.fn(),
	getOptions: jest.fn(),
	getScreenshotUrl: jest.fn(),
};

describe( 'RecommendedSections', () => {
	test( 'renders all three sections', () => {
		render( <RecommendedSections { ...defaultProps } /> );
		expect( screen.getByTestId( 'theme-section-favorites' ) ).toBeVisible();
		expect( screen.getByTestId( 'theme-section-fresh' ) ).toBeVisible();
		expect( screen.getByTestId( 'theme-section-partner' ) ).toBeVisible();
	} );

	test( 'renders section titles', () => {
		render( <RecommendedSections { ...defaultProps } /> );
		expect( screen.getByText( 'Our favorites' ) ).toBeVisible();
		expect( screen.getByText( 'Fresh themes' ) ).toBeVisible();
		expect( screen.getByText( 'Partner themes' ) ).toBeVisible();
	} );

	test( 'renders AI Builder banner between favorites and fresh sections', () => {
		render( <RecommendedSections { ...defaultProps } /> );
		expect( screen.getByTestId( 'ai-builder-banner' ) ).toBeVisible();
	} );

	test( 'renders DIFM banner between fresh and partner sections', () => {
		render( <RecommendedSections { ...defaultProps } /> );
		expect( screen.getByTestId( 'difm-banner' ) ).toBeVisible();
	} );

	test( 'sets correct see-all URLs for each section', () => {
		render( <RecommendedSections { ...defaultProps } /> );
		expect( screen.getByTestId( 'theme-section-favorites' ) ).toHaveAttribute(
			'data-see-all-url',
			'/themes/recommended/collection'
		);
		expect( screen.getByTestId( 'theme-section-fresh' ) ).toHaveAttribute(
			'data-see-all-url',
			'/themes/all'
		);
		expect( screen.getByTestId( 'theme-section-partner' ) ).toHaveAttribute(
			'data-see-all-url',
			'/themes/partner'
		);
	} );

	test( 'uses dark variant for partner section only', () => {
		render( <RecommendedSections { ...defaultProps } /> );
		expect( screen.getByTestId( 'theme-section-favorites' ) ).toHaveAttribute(
			'data-variant',
			'light'
		);
		expect( screen.getByTestId( 'theme-section-fresh' ) ).toHaveAttribute(
			'data-variant',
			'light'
		);
		expect( screen.getByTestId( 'theme-section-partner' ) ).toHaveAttribute(
			'data-variant',
			'dark'
		);
	} );

	test( 'renders sections and banners in correct order', () => {
		const { container } = render( <RecommendedSections { ...defaultProps } /> );
		const children = Array.from(
			container.querySelector( '.recommended-sections' )?.children ?? []
		);
		const testIds = children.map( ( el ) => el.getAttribute( 'data-testid' ) );
		expect( testIds ).toEqual( [
			'theme-section-favorites',
			'ai-builder-banner',
			'theme-section-fresh',
			'difm-banner',
			'theme-section-partner',
		] );
	} );
} );
