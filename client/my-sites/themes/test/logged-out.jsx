/**
 * Tests for controller.jsx
 */

/**
 * External dependencies
 */
import { noop } from 'lodash';
import { assert } from 'chai';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import { createReduxStore } from 'state';
import EmptyComponent from 'test/helpers/react/empty-component';
import useMockery from 'test/helpers/use-mockery';

describe( 'logged-out', () => {
	context( 'when calling renderToString()', function() {
		useMockery( mockery => {
			mockery.registerMock( 'lib/analytics', noop );
			mockery.registerMock( './theme-preview', EmptyComponent );
			mockery.registerMock( 'components/popover', EmptyComponent );
			mockery.registerMock( 'lib/analytics/page-view-tracker', EmptyComponent );

			this.LoggedOutShowcase = require( '../logged-out' );
		} );

		it( 'renders', () => {
			const store = createReduxStore();
			const layout = (
				<ReduxProvider store={ store }>
					<this.LoggedOutShowcase />
				</ReduxProvider>
			);

			assert.doesNotThrow( () => renderToString( layout ) );
		} );
	} );
} );
