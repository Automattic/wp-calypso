/**
 * External dependencies
 */

import React, { PropTypes } from 'react';

export default React.createClass( {
	displayName: 'Page404',

	render() {
		return (
			<div className="empty-content">
				<img className="empty-content__illustration" src="/calypso/images/drake/drake-404.svg" />
				<h2 className="empty-content__title">Uh oh. Page not found.</h2>
				<h3 className="empty-content__line">
					Sorry, the page you were looking for doesn't exist or has been moved.
				</h3>
				<a href="/" className="empty-content__action button button-primary">Go back home</a>
			</div>
		);
	}
} );