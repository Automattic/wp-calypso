/**
 * @jest-environment jsdom
 */
import { parse } from 'url';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Theme } from '../';

jest.mock( 'calypso/components/popover-menu', () => 'components--popover--menu' );
jest.mock( 'calypso/components/popover-menu/item', () => 'components--popover--menu-item' );
jest.mock( 'calypso/components/theme-tier/theme-tier-badge', () => 'components--theme-tier-badge' );

describe( 'Theme', () => {
	const props = {
		theme: {
			id: 'twentyseventeen',
			name: 'Twenty Seventeen',
			screenshot:
				'https://i0.wp.com/s0.wp.com/wp-content/themes/pub/twentyseventeen/screenshot.png?ssl=1',
		},
		translate: ( string ) => string,
		setThemesBookmark: () => {},
		onScreenshotClick: () => {},
	};

	describe( 'rendering', () => {
		test( 'should render an element with a className of "theme"', () => {
			const { container } = render( <Theme { ...props } /> );
			expect( container.firstChild ).toHaveClass( 'theme-card--is-actionable' );
			expect( container.getElementsByTagName( 'h2' )[ 0 ] ).toHaveTextContent( 'Twenty Seventeen' );
		} );

		test( 'should render a screenshot', () => {
			render( <Theme { ...props } /> );
			const img = screen.getByRole( 'presentation' );
			expect( img ).toHaveAttribute( 'src', expect.stringContaining( '/screenshot.png' ) );
		} );

		test( 'should include photon parameters', () => {
			render( <Theme { ...props } /> );
			const img = screen.getByRole( 'presentation' );
			const { query } = parse( img.getAttribute( 'src' ), true );

			expect( query ).toMatchObject( {
				fit: expect.stringMatching( /\d+,\d+/ ),
			} );
		} );

		test( 'should call onScreenshotClick() on click on screenshot', async () => {
			const onScreenshotClick = jest.fn();
			render( <Theme { ...props } onScreenshotClick={ onScreenshotClick } index={ 1 } /> );

			const img = screen.getByRole( 'presentation' );
			await userEvent.click( img );
			expect( onScreenshotClick ).toHaveBeenCalledTimes( 1 );
			expect( onScreenshotClick ).toHaveBeenCalledWith( props.theme.id, 1 );
		} );

		test( 'should not show a price when there is none', () => {
			const { container } = render( <Theme { ...props } /> );

			expect( container.getElementsByClassName( 'price' ) ).toHaveLength( 0 );
		} );

		test( 'should match snapshot', () => {
			const { container } = render( <Theme { ...props } /> );
			expect( container.firstChild ).toMatchSnapshot();
		} );
	} );

	describe( 'when isPlaceholder is set to true', () => {
		test( 'should render an element with an is-placeholder class', () => {
			const theme = { id: 'placeholder-1', name: 'Loading' };
			const { container } = render( <Theme { ...props } theme={ theme } isPlaceholder /> );

			expect( container.firstChild ).toHaveClass( 'is-placeholder' );
		} );
	} );

	describe( 'modern overlay', () => {
		const modernButtonContents = {
			preview: {
				label: 'Demo site',
				action: jest.fn(),
			},
			signup: {
				label: 'Get started',
				getUrl: jest.fn( () => '/start/with-theme?theme=twentyseventeen' ),
			},
		};

		test( 'should render overlay buttons when isThemeShowcaseModern is true', () => {
			render(
				<Theme { ...props } isThemeShowcaseModern buttonContents={ modernButtonContents } />
			);

			expect( screen.getByText( 'Preview demo' ) ).toBeVisible();
			expect( screen.getByText( 'Get started' ) ).toBeVisible();
		} );

		test( 'should not render overlay buttons when isThemeShowcaseModern is false', () => {
			render( <Theme { ...props } buttonContents={ modernButtonContents } /> );

			expect( screen.queryByText( 'Preview demo' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Get started' ) ).not.toBeInTheDocument();
		} );

		test( 'should call preview action when Preview demo button is clicked', async () => {
			const previewAction = jest.fn();
			const buttonContents = {
				...modernButtonContents,
				preview: { ...modernButtonContents.preview, action: previewAction },
			};

			render( <Theme { ...props } isThemeShowcaseModern buttonContents={ buttonContents } /> );

			await userEvent.click( screen.getByText( 'Preview demo' ) );
			expect( previewAction ).toHaveBeenCalledWith( props.theme.id );
		} );
	} );

	describe( 'Update themes', () => {
		test( 'Should show the update message', () => {
			const updateThemeProps = {
				...props,
				theme: {
					...props.theme,
					update: {},
				},
			};
			const { container } = render( <Theme { ...updateThemeProps } /> );
			expect( container.getElementsByClassName( 'theme__update-alert' ).length ).toBe( 1 );
		} );
	} );
} );
