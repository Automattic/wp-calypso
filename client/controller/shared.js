/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';

/**
 * Internal dependencies
 */
import { setSection as setSectionAction } from 'state/ui/actions';
import { getCurrentUser } from 'state/current-user/selectors';

export function makeLayoutMiddleware( LayoutComponent ) {
	return ( context, next ) => {
		const { store, primary, secondary } = context;

		// On server, only render LoggedOutLayout when logged-out.
		if ( ! context.isServerSide || ! getCurrentUser( context.store.getState() ) ) {
			context.layout = (
				<LayoutComponent store={ store }
					primary={ primary }
					secondary={ secondary }
				/>
			);
		}
		next();
	};
}

export function setSection( section ) {
	return ( context, next = noop ) => {
		context.store.dispatch( setSectionAction( section ) );

		next();
	};
}
