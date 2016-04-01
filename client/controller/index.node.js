/**
 * External Dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { setSection as setSectionAction } from 'state/ui/actions';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import LayoutLoggedOut from 'layout/logged-out';
import { getCurrentUser } from 'state/current-user/selectors';

export function makeLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const { store, primary, secondary, tertiary } = context;

		// On server, only render LoggedOutLayout when logged-out.
		if ( ! context.isServerSide || getCurrentUser( context.store.getState() ) ) {
			context.layout = (
				<LayoutComponent store={ store }
					primary={ primary }
					secondary={ secondary }
					tertiary={ tertiary }
				/>
			);
		}
		next();
	};
}

const ReduxWrappedLoggedOutLayout = ( { store, primary, secondary, tertiary } ) => (
	<ReduxProvider store={ store }>
		<LayoutLoggedOut primary={ primary }
			secondary={ secondary }
			tertiary={ tertiary } />
	</ReduxProvider>
);

/**
 * @param { object } context -- Middleware context
 * @param { function } next -- Call next middleware in chain
 *
 * Produce a `LayoutLoggedOut` element in `context.layout`, using
 * `context.primary`, `context.secondary`, and `context.tertiary` to populate it.
*/
export const makeLayout = makeLayoutMiddleware( ReduxWrappedLoggedOutLayout );

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		next();
	};
}
