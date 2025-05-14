/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import PluginRatings from 'calypso/my-sites/plugins/plugin-ratings';

describe( 'PluginRatings', () => {
	test( 'should return nothing', () => {
		const rating = null;
		render( <PluginRatings rating={ rating } /> );
		expect( screen.queryByText( '2.5/5' ) ).toBeNull();
	} );

	test( 'should return a rating', () => {
		const rating = 50;
		render( <PluginRatings rating={ rating } /> );
		expect( screen.getByText( '2.5/5' ) ).toBeInTheDocument();
	} );

	test( 'should return no decimals places when appropriate', () => {
		const rating = 20;
		render( <PluginRatings rating={ rating } /> );
		expect( screen.getByText( '1/5' ) ).toBeInTheDocument();
	} );
} );
