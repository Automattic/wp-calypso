import PropTypes from 'prop-types';
import { createContext, PureComponent } from 'react';
import { Provider } from 'react-redux';
import repliesCache from './comment-replies-cache';
import RestClient from './rest-client';
import { init as initAPI } from './rest-client/wpcom';
import { init as initStore, store } from './state';
import { mergeHandlers } from './state/action-middleware/utils';
import { SET_IS_SHOWING } from './state/action-types';
import actions from './state/actions';
import Layout from './templates';
const debug = require( 'debug' )( 'notifications:panel' );

import './boot/stylesheets/style.scss';

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
		customMiddleware: PropTypes.object,
		isShowing: PropTypes.bool,
		isVisible: PropTypes.bool,
		locale: PropTypes.string,
		receiveMessage: PropTypes.func,
		wpcom: PropTypes.object.isRequired,
	};

	static defaultProps = {
		customEnhancer: ( a ) => a,
		customMiddleware: {},
		isShowing: false,
		isVisible: false,
		locale: 'en',
		receiveMessage: noop,
	};

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillMount() {
		debug( 'component will mount', this.props );
		const { customEnhancer, customMiddleware, isShowing, isVisible, receiveMessage, wpcom } =
			this.props;

		initStore( {
			customEnhancer,
			customMiddleware: mergeHandlers( customMiddleware, {
				APP_REFRESH_NOTES: [
					( _store, action ) => {
						if ( ! client ) {
							return;
						}

						if ( 'boolean' === typeof action.isVisible ) {
							// this is the next issue. isShowing is always the mount value. bad.
							client.setVisibility.call( client, {
								isShowing: this.props.isShowing,
								isVisible: action.isVisible,
							} );
						}

						client.refreshNotes.call( client, action.isVisible );
					},
				],
			} ),
		} );

		initAPI( wpcom );

		client = new RestClient();
		client.global = globalData;
		client.sendMessage = receiveMessage;

		/**
		 * Initialize store with actions that need to occur on
		 * transitions from open to close or close to open
		 * @todo Pass this information directly into the Redux initial state
		 */
		store.dispatch( { type: SET_IS_SHOWING, isShowing } );

		client.setVisibility( { isShowing, isVisible } );
	}

	componentDidMount() {
		debug( 'component did mount', this.props );
		store.dispatch( { type: 'APP_IS_READY' } );
	}

	componentDidUpdate( prevProps ) {
		debug( 'Panel did update', {
			isShowing: this.props.isShowing,
			isVisible: this.props.isVisible,
			wpcom: this.props.wpcom,
			prevShowing: prevProps.isShowing,
			prevVis: prevProps.isVisible,
			prevWPcom: prevProps.wpcom,
		} );

		// if ( prevProps.wpcom !== this.props.wpcom ) {
		// 	initAPI( this.props.wpcom );
		// }

		// if ( ! this.props.isShowing && prevProps.isShowing ) {
		// 	// unselect the note so keyhandlers don't steal keystrokes
		// 	store.dispatch( actions.ui.unselectNote() );
		// }

		// if ( prevProps.isShowing !== this.props.isShowing ) {
		// 	store.dispatch( { type: SET_IS_SHOWING, isShowing: this.props.isShowing } );
		// }

		// if (
		// 	prevProps.isShowing !== this.props.isShowing ||
		// 	prevProps.isVisible !== this.props.isVisible
		// ) {
		// 	client.setVisibility( { isShowing: this.props.isShowing, isVisible: this.props.isVisible } );
		// }
	}

	// @TODO: Please update https://github.com/Automattic/wp-calypso/issues/58453 if you are refactoring away from UNSAFE_* lifecycle methods!
	UNSAFE_componentWillReceiveProps( { isShowing, isVisible, wpcom } ) {
		debug( 'Panel will recieve props', {
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
			client.setVisibility( { isShowing, isVisible } );
		}
	}

	render() {
		return (
			<Provider store={ store }>
				<RestClientContext.Provider value={ client }>
					<Layout
						client={ client }
						data={ globalData }
						global={ globalData }
						isShowing={ this.props.isShowing }
						locale={ this.props.local }
					/>
				</RestClientContext.Provider>
			</Provider>
		);
	}
}

export default Notifications;
