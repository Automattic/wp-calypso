/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeSectionHeader from '../theme-section-header';

describe( 'ThemeSectionHeader', () => {
	const defaultProps = {
		title: 'Our Favorites',
		subtitle: 'Hand-picked themes we love',
		buttonLabel: 'See all',
		onButtonClick: jest.fn(),
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'renders title and subtitle', () => {
		render( <ThemeSectionHeader { ...defaultProps } /> );
		expect( screen.getByText( 'Our Favorites' ) ).toBeVisible();
		expect( screen.getByText( 'Hand-picked themes we love' ) ).toBeVisible();
	} );

	test( 'renders title as h2', () => {
		render( <ThemeSectionHeader { ...defaultProps } /> );
		expect( screen.getByRole( 'heading', { level: 2, name: 'Our Favorites' } ) ).toBeVisible();
	} );

	test( 'renders button with provided label', () => {
		render( <ThemeSectionHeader { ...defaultProps } /> );
		expect( screen.getByRole( 'button', { name: 'See all' } ) ).toBeVisible();
	} );

	test( 'calls onButtonClick when button is clicked', async () => {
		const user = userEvent.setup();
		render( <ThemeSectionHeader { ...defaultProps } /> );
		await user.click( screen.getByRole( 'button', { name: 'See all' } ) );
		expect( defaultProps.onButtonClick ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does not render button when buttonLabel is omitted', () => {
		render( <ThemeSectionHeader title="Our Favorites" subtitle="Hand-picked themes we love" /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	test( 'does not render button when onButtonClick is omitted', () => {
		render(
			<ThemeSectionHeader
				title="Our Favorites"
				subtitle="Hand-picked themes we love"
				buttonLabel="See all"
			/>
		);
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );
