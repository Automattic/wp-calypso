import { NewsletterWidget } from '@automattic/newsletter-widget';
import { createRoot } from '@wordpress/element';

// Mount the React component to the DOM
const container = document.getElementById( 'newsletter-widget-app' );
if ( container ) {
	const root = createRoot( container );
	root.render( <NewsletterWidget /> );
}
