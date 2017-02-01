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
import { renderPage } from 'lib/react-helpers';
import HelpComponent from './main';
import CoursesComponent from './help-courses';
import ContactComponent from './help-contact';

export default {
	help( context ) {
		const basePath = route.sectionify( context.path );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Help', { textOnly: true } ) ) );

		analytics.pageView.record( basePath, 'Help' );

		renderPage(
			<HelpComponent isCoursesEnabled={ config.isEnabled( 'help/courses' ) } />,
			context
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
