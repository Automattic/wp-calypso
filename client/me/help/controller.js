/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { login } from 'lib/paths';
import route from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import HelpComponent from './main';
import CoursesComponent from './help-courses';
import ContactComponent from './help-contact';
import support from 'lib/url/support';
import userUtils from 'lib/user/utils';

export default {
	loggedOut( context, next ) {
		if ( userUtils.isLoggedIn() ) {
			return next();
		}

		let url;
		switch ( context.path ) {
			case '/help':
				url = support.SUPPORT_ROOT;
				break;
			case '/help/contact':
				url = support.CONTACT;
				break;
			default:
				url = login( { redirectTo: window.location.href } );
		}

		// Not using the page library here since this is an external URL
		window.location.href = url;
	},

	help( context ) {
		const basePath = route.sectionify( context.path );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Help', { textOnly: true } ) ) );

		analytics.pageView.record( basePath, 'Help' );

		renderWithReduxStore(
			<HelpComponent isCoursesEnabled={ config.isEnabled( 'help/courses' ) } />,
			document.getElementById( 'primary' ),
			context.store
		);
	},

	courses( context ) {
		const basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Help > Courses' );

		renderWithReduxStore(
			<CoursesComponent />,
			'primary',
			context.store
		);
	},

	contact( context ) {
		const basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Help > Contact' );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		renderWithReduxStore(
			<ContactComponent clientSlug={ config( 'client_slug' ) } />,
			'primary',
			context.store
		);
	}
};
