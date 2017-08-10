/** @format */
/**
 * External Dependencies
 */
import { omit } from 'lodash';
import React from 'react';
import { setSection } from 'state/ui/actions';

/**
 * Internal Dependencies
 */
import MainComponent from './main';
import { renderWithReduxStore } from 'lib/react-helpers';

export default {
	unsubscribe( context ) {
		// We don't need the sidebar here.
		context.store.dispatch(
			setSection(
				{ name: 'me' },
				{
					hasSidebar: false,
				}
			)
		);

		renderWithReduxStore(
			React.createElement( MainComponent, {
				email: context.query.email,
				category: context.query.category,
				hmac: context.query.hmac,
				context: omit( context.query, [ 'email', 'category', 'hmac' ] ),
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
