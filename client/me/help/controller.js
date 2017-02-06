/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import config from 'config';
import { renderWithReduxStore } from 'lib/react-helpers';
import HelpComponent from './main';
import CoursesComponent from './help-courses';
import ContactComponent from './help-contact';
import userUtils from 'lib/user/utils';
import support from 'lib/url/support';

export default {
	loggedOut( context, next ) {
		if ( userUtils.isLoggedIn() ) {
			return next();
		}

		const url = ( context.path === '/help' )
			? support.SUPPORT_ROOT
			: userUtils.getLoginUrl( window.location.href );

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

		ReactDom.render(
			<ReduxProvider store={ context.store } >
				<CoursesComponent />
			</ReduxProvider>,
			document.getElementById( 'primary' )
		);
	},

	contact( context ) {
		const basePath = route.sectionify( context.path );

		analytics.pageView.record( basePath, 'Help > Contact' );

		// Scroll to the top
		if ( typeof window !== 'undefined' ) {
			window.scrollTo( 0, 0 );
		}

		ReactDom.render(
			<ReduxProvider store={ context.store } >
				<ContactComponent clientSlug={ config( 'client_slug' ) } />
			</ReduxProvider>,
			document.getElementById( 'primary' )
		);
	}
};
