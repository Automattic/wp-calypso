/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import { makeLayoutMiddleware } from './shared.js';
import LayoutLoggedOut from 'layout/logged-out';

/**
 * Re-export
 */
export { setSection } from './shared.js';

const ReduxWrappedLoggedOutLayout = ({ store, primary, secondary, tertiary }) => (
    <ReduxProvider store={store}>
        <LayoutLoggedOut primary={primary} secondary={secondary} tertiary={tertiary} />
    </ReduxProvider>
);

/**
 * @param { object } context -- Middleware context
 * @param { function } next -- Call next middleware in chain
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `context.primary`, `context.secondary`, and `context.tertiary` to populate it.
*/
export const makeLayout = makeLayoutMiddleware(ReduxWrappedLoggedOutLayout);
