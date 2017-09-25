/**
 * External dependencies
 */
import { omit } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import MainComponent from './main';
import { renderWithReduxStore } from 'lib/react-helpers';
import { setSection } from 'state/ui/actions';

export default {
	unsubscribe( context ) {
		// We don't need the sidebar here.
		context.store.dispatch( setSection( { name: 'me' }, {
			hasSidebar: false
		} ) );

		renderWithReduxStore(
			React.createElement( MainComponent, {
				email: context.query.email,
				category: context.query.category,
				hmac: context.query.hmac,
				context: omit( context.query, [ 'email', 'category', 'hmac' ] )
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
