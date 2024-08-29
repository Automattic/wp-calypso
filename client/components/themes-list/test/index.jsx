/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import deepFreeze from 'deep-freeze';
import themes from 'calypso/state/themes/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { ThemesList } from '../';

const noop = () => {};

jest.mock( 'calypso/components/theme', () => ( { theme } ) => (
	<div data-testid={ `theme-${ theme.id }` } />
) );

jest.mock( 'calypso/data/site-assembler', () => ( {
	useIsSiteAssemblerEnabledExp: () => true,
} ) );

jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: () => false,
} ) );

const defaultProps = deepFreeze( {
	themes: [
		{
			id: '1',
			name: 'kubrick',
			screenshot: '/theme/kubrick/screenshot.png',
		},
		{
			id: '2',
			name: 'picard',
			screenshot: '/theme/picard/screenshot.png',
		},
	],
	lastPage: true,
	loading: false,
	isRequestFulfilled: true,
	fetchNextPage: noop,
	getButtonOptions: noop,
	onScreenshotClick: noop,
	upsellCardDisplayed: noop,
	translate: ( string ) => string,
} );

const render = ( el, options ) => renderWithProvider( el, { ...options, reducers: { themes } } );

describe( 'ThemesList', () => {
	test( 'should render a div with a className of "themes-list"', () => {
		const { container } = render( <ThemesList { ...defaultProps } /> );
		expect( container ).toMatchSnapshot();
		expect( container.firstChild ).toHaveClass( 'themes-list' );
	} );

	test( 'should render a <Theme /> child for each provided theme', () => {
		render( <ThemesList { ...defaultProps } /> );
		expect( screen.getAllByTestId( /theme-/ ) ).toHaveLength( defaultProps.themes.length );
	} );

	test( 'should display a message when no themes are found', () => {
		render( <ThemesList { ...defaultProps } themes={ [] } /> );
		expect( screen.getByText( /No themes match your search/i ) ).toBeInTheDocument();
	} );
} );
