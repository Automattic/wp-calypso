// External dependencies
import React from 'react';

// Internal dependencies
import page from 'page';

const StartRedirect = React.createClass( {
	render() {
		page.redirect( '/read/start' );
		return null;
	}
} );

export default StartRedirect;
