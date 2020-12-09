/**
 * External dependencies
 */
import * as React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
/**
 * Internal dependencies
 */
import ScrollToTop from '../';

describe( 'ScrollToTop', () => {
	test( 'should scroll to the top on every route changes', () => {
		const spy = jest.spyOn( document, 'querySelector' );
		const history = createMemoryHistory();
		render(
			<Router history={ history }>
				<ScrollToTop selector=".foo" />
			</Router>
		);

		// Trigger a route change by pushing a new path to the router's history
		history.push( '/bar' );

		expect( spy ).toHaveBeenCalledTimes( 1 );
	} );
} );
