/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import WritingMain from 'my-sites/site-settings/settings-writing/main';
import Taxonomies from 'my-sites/site-settings/taxonomies';

export default {
	writing( context ) {
		renderWithReduxStore(
			React.createElement( WritingMain ),
			document.getElementById( 'primary' ),
			context.store
		);
	},

	taxonomies( context ) {
		renderWithReduxStore(
			React.createElement( Taxonomies, {
				taxonomy: context.params.taxonomy,
				postType: 'post',
			} ),
			document.getElementById( 'primary' ),
			context.store
		);
	},
};
