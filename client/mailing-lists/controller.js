/**
 * External Dependencies
 */
import omit from 'lodash/omit';
import React from 'react';
import { setSection } from 'state/ui/actions';

/**
 * Internal Dependencies
 */
import MainComponent from './main';

export default {
	unsubscribe(context, next) {
	    // We don't need the sidebar here.
		context.store.dispatch( setSection( { name: 'me' }, {
			hasSidebar: false
		} ) );

		context.primary = React.createElement( MainComponent, {
			email: context.query.email,
			category: context.query.category,
			hmac: context.query.hmac,
			context: omit( context.query, [ 'email', 'category', 'hmac' ] )
		} );
		next();
	}
};
