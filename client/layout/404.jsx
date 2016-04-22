/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

export default React.createClass( {
	goToHome() {
		page.redirect( '/' );
	},

	render() {
		return (
			<EmptyContent
				illustration="/calypso/images/drake/drake-404.svg"
				title={ this.translate( 'Uh oh. Page not found.' ) }
				line={ this.translate( 'Sorry, the page you were looking for doesn\'t exist or has been moved.' ) }
				action={ this.translate( 'Return to Home' ) }
				actionURL="/"
				actionCallback={ this.goToHome }
			/>
		);
	}
} );
