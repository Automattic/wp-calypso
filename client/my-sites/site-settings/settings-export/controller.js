/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import ExportSettings from 'my-sites/site-settings/settings-export/main';
import GuidedTransfer from 'my-sites/site-settings/settings-export/guided-transfer';

function renderPage( context, component ) {
	renderWithReduxStore(
		component,
		document.getElementById( 'primary' ),
		context.store
	);
}

export default {
	exportSite( context ) {
		renderPage( context, <ExportSettings /> );
	},

	guidedTransfer( context ) {
		renderPage(
			context,
			<GuidedTransfer hostSlug={ context.params.host_slug } />
		);
	},
};
