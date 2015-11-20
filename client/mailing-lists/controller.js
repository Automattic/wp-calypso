/**
 * External Dependencies
 */
import omit from 'lodash/object/omit';
import React from 'react';

/**
 * Internal Dependencies
 */
import MainComponent from './main';

export default {
	unsubscribe( context ) {
		React.render(
			React.createElement( MainComponent, {
				email: context.query.email,
				category: context.query.category,
				hmac: context.query.hmac,
				context: omit( context.query, [ 'email', 'category', 'hmac' ] )
			} ),
			document.getElementById( 'primary' )
		);
	}
};
