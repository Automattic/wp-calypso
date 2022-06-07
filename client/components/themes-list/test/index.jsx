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
	fetchNextPage: noop,
	getButtonOptions: noop,
	onScreenshotClick: noop,
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

	test( 'should display the EmptyContent component when no themes are found', () => {
		render( <ThemesList { ...defaultProps } themes={ [] } /> );
		expect( screen.getByText( /no themes found/i ) ).toBeInTheDocument();
	} );
} );
