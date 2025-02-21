import config from '@automattic/calypso-config';
import { NewsletterWidget } from '@automattic/newsletter-widget';
import { createRoot } from '@wordpress/element';

import './style.scss';

const hostname = config( 'hostname' );
const adminUrl = config( 'admin_url' );

// Mount the React component to the DOM
const container = document.getElementById( 'newsletter-widget-app' );
if ( container ) {
	const root = createRoot( container );
	root.render( <NewsletterWidget hostname={ hostname } adminUrl={ adminUrl } /> );
}
