/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import page from 'page';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { setSection } from 'state/ui/actions';

let Page404 = React.createClass( {
	displayName: 'Page404',

	statics: {
		show( context ) {
			context.store.dispatch( setSection( null, { hasSidebar: false } ) );

			ReactDom.render(
				React.createElement( Page404, {} ),
				document.getElementById( 'primary' )
			);
		}
	},

	redirectHome() {
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
				actionCallback={ this.redirectHome }
			/>
		);
	}
} );

export default Page404;