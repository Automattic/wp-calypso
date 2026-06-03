import debugFactory from 'debug';
import PropTypes from 'prop-types';
import { createContext, PureComponent } from 'react';
import { Provider } from 'react-redux';
import repliesCache from './comment-replies-cache';
import RestClient from './rest-client';
import { init as initAPI } from './rest-client/wpcom';
import { init as initStore, store } from './state';
import { SET_IS_SHOWING } from './state/action-types';
import actions from './state/actions';
import { addListeners, removeListeners } from './state/create-listener-middleware';
import Layout from './templates';

import './boot/stylesheets/style.scss';

const debug = debugFactory( 'notifications:panel' );

let client;

const noop = () => {};
const globalData = {};

repliesCache.cleanup();

/**
 * Force a manual refresh of the notes data
 */
export const refreshNotes = () => client && client.refreshNotes.call( client );

export const RestClientContext = createContext( client );

export class Notifications extends PureComponent {
	static propTypes = {
		customEnhancer: PropTypes.func,
		actionHandlers: PropTypes.object,
		isShowing: PropTypes.bool,
		isVisible: PropTypes.bool,
		locale: PropTypes.string,
		receiveMessage: PropTypes.func,
		wpcom: PropTypes.object.isRequired,
		forceLocale: PropTypes.bool,
	};

	static defaultProps = {
		customEnhancer: ( a ) => a,
		actionHandlers: {},
		isShowing: false,
		isVisible: false,
		locale: 'en',
		receiveMessage: noop,
	};

	defaultHandlers = {
		APP_REFRESH_NOTES: [
			( _store, action ) => {
				if ( ! client ) {
					return;
				}

				if ( 'boolean' === typeof action.isVisible ) {
					debug( 'APP_REFRESH_NOTES', {
						isShowing: this.props.isShowing,
						isVisible: action.isVisible,
					} );
					// Use this.props instead of destructuring isShowing, so that this uses
					// the value on props at any given time and not only the value that was
					// present on initial mount.
					client.setVisibility.call( client, {
						isShowing: this.props.isShowing,
						isVisible: action.isVisible,
					} );
				}

				client.refreshNotes.call( client, action.isVisible );
			},
		],
	};

	state = {
		// Set up the client in componentDidMount (the commit phase), not the
		// constructor. React can run the constructor/render phase many times
		// before it commits a mount (concurrent rendering, Suspense retries),
		// and `new RestClient()` immediately starts polling the notifications
		// REST API. Creating the client in the constructor therefore fired a
		// request on every discarded render attempt and flooded the endpoint.
		// componentDidMount runs exactly once per mount.
		isReady: false,
	};

	componentDidMount() {
		const { customEnhancer, actionHandlers, isShowing, isVisible, receiveMessage, wpcom } =
			this.props;

		initStore( { customEnhancer } );

		store.dispatch( addListeners( actionHandlers ) );
		store.dispatch( addListeners( this.defaultHandlers ) );

		initAPI( wpcom );

		client = new RestClient();
		client.global = globalData;
		client.sendMessage = receiveMessage;

		if ( this.props.forceLocale ) {
			client.locale = this.props.locale;
		}

		/**
		 * Initialize store with actions that need to occur on
		 * transitions from open to close or close to open
		 * @todo Pass this information directly into the Redux initial state
		 */
		store.dispatch( { type: SET_IS_SHOWING, isShowing } );

		client.setVisibility( { isShowing, isVisible } );

		store.dispatch( { type: 'APP_IS_READY' } );

		// The client is intentionally created here, in the commit phase; render
		// one more time now that it exists so the panel can mount with it.
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { isReady: true } );
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( { isShowing, isVisible, wpcom } ) {
		debug( 'Component will recieve props', {
			isShowing,
			isVisible,
			wpcom,
			prevShowing: this.props.isShowing,
			prevVis: this.props.isVisible,
			prevWPcom: this.props.wpcom,
		} );

		if ( wpcom !== this.props.wpcom ) {
			initAPI( wpcom );
		}

		if ( this.props.isShowing && ! isShowing ) {
			// unselect the note so keyhandlers don't steal keystrokes
			store.dispatch( actions.ui.unselectNote() );
		}

		if ( isShowing !== this.props.isShowing ) {
			store.dispatch( { type: SET_IS_SHOWING, isShowing } );
		}

		if ( isShowing !== this.props.isShowing || isVisible !== this.props.isVisible ) {
			client?.setVisibility( { isShowing, isVisible } );
		}
	}

	componentWillUnmount() {
		const { actionHandlers } = this.props;
		store.dispatch( removeListeners( actionHandlers ) );
		store.dispatch( removeListeners( this.defaultHandlers ) );
	}

	render() {
		// Nothing to render until componentDidMount has created the client and
		// initialized the store. This also keeps the constructor/render phase
		// free of the side effects that previously ran on every render attempt.
		if ( ! this.state.isReady ) {
			return null;
		}

		return (
			<Provider store={ store }>
				<RestClientContext.Provider value={ client }>
					<Layout
						client={ client }
						data={ globalData }
						global={ globalData }
						isShowing={ this.props.isShowing }
						locale={ this.props.locale }
					/>
				</RestClientContext.Provider>
			</Provider>
		);
	}
}

export default Notifications;
