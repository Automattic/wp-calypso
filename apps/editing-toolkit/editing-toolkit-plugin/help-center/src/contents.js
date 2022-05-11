/**
 * Global polyfills
 */
import '@automattic/calypso-polyfills';
import { ContactForm } from '@automattic/help-center';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import InlineHelpCenterContent from 'calypso/blocks/inline-help/inline-help-center-content';
import QuerySites from 'calypso/components/data/query-sites';
import { initializeAnalytics } from 'calypso/lib/analytics/init';
import getSuperProps from 'calypso/lib/analytics/super-props';
import { rawCurrentUserFetch, filterUserObject } from 'calypso/lib/user/shared-utils';
import analyticsMiddleware from 'calypso/state/analytics/middleware';
import consoleDispatcher from 'calypso/state/console-dispatch';
import { setCurrentUser } from 'calypso/state/current-user/actions';
import currentUser from 'calypso/state/current-user/reducer';
import happychatMiddleware from 'calypso/state/happychat/middleware';
import { requestHappychatEligibility } from 'calypso/state/happychat/user/actions';
import { setStore } from 'calypso/state/redux-store';
import sites from 'calypso/state/sites/reducer';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { setSection } from 'calypso/state/ui/section/actions';
import { combineReducers, addReducerEnhancer } from 'calypso/state/utils';

const rootReducer = combineReducers( {
	currentUser,
	sites,
} );

const store = createStore(
	rootReducer,
	compose(
		consoleDispatcher,
		addReducerEnhancer,
		applyMiddleware( thunkMiddleware, analyticsMiddleware, happychatMiddleware )
	)
);

setStore( store );

//For the moment we have the help center only in the editor
store.dispatch( setSection( { name: 'gutenberg-editor' } ) );

store.dispatch( setSelectedSiteId( window._currentSiteId ) );

rawCurrentUserFetch()
	.then( filterUserObject )
	.then( ( user ) => {
		if ( user ) {
			store.dispatch( setCurrentUser( user ) );
		}
		initializeAnalytics( user || undefined, getSuperProps( store ) );

		store.dispatch( requestHappychatEligibility() );
	} );

export default function Content() {
	const [ contactForm, setContactForm ] = useState( null );
	const [ openInContactPage, setOpenInContactPage ] = useState( null );

	return (
		<Provider store={ store }>
			<>
				<QuerySites siteId={ window._currentSiteId } />
				{ contactForm ? (
					<ContactForm
						mode={ contactForm }
						onBackClick={ () => {
							setOpenInContactPage( true );
							setContactForm( null );
						} }
						onGoHome={ () => {
							setOpenInContactPage( false );
							setContactForm( null );
						} }
						siteId={ window._currentSiteId }
					/>
				) : (
					<InlineHelpCenterContent
						setContactFormOpen={ setContactForm }
						openInContactPage={ openInContactPage }
					/>
				) }
			</>
		</Provider>
	);
}
