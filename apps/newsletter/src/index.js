/* global __i18n_text_domain__ */

import { createRoot } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

function Newsletter() {
	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<h1 className="text-4xl font-bold text-gray-800">
				{ __( 'This is the placeholder for the newsletter widget', __i18n_text_domain__ ) }
			</h1>
		</div>
	);
}

// Mount the React component to the DOM
const container = document.getElementById( 'newsletter-widget-app' );
if ( container ) {
	const root = createRoot( container );
	root.render( <Newsletter /> );
}

export default Newsletter;
