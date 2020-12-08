/**
 * External dependencies
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter as Router } from 'react-router-dom';

/**
 * Internal dependencies
 */
import ScrollToTop from '../';

const renderComponent = ( { path } ) =>
	render(
		<Router initialEntries={ [ path ] }>
			<ScrollToTop />
		</Router>
	);

describe( 'ScrollToTop', () => {
	test( 'should scroll to the top on every route changes', () => {
		const spy = jest.spyOn( document, 'querySelector' );

		renderComponent( { path: '/foo' } );
		renderComponent( { path: '/bar' } );
		renderComponent( { path: '/baz' } );

		expect( spy ).toHaveBeenCalledTimes( 3 );
	} );
} );
