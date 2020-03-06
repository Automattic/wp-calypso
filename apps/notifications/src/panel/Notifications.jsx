import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';
import { noop } from 'lodash';

import { init as initStore, store } from './state';
import { SET_IS_SHOWING } from './state/action-types';
import actions from './state/actions';

import RestClient from './rest-client';
import { setGlobalData } from './flux/app-actions';
import repliesCache from './comment-replies-cache';

import { init as initAPI } from './rest-client/wpcom';

import Layout from './templates';

/**
 * Style dependencies
 */
import './boot/stylesheets/style.scss';

let client;

const globalData = {};

setGlobalData( globalData );

repliesCache.cleanup();

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
		customEnhancer: a => a,
		customMiddleware: {},
		isShowing: false,
		isVisible: false,
		locale: 'en',
		receiveMessage: noop,
	};

	UNSAFE_componentWillMount() {
		const { customEnhancer, customMiddleware, isShowing, receiveMessage, wpcom } = this.props;

		initStore( { customEnhancer, customMiddleware } );
		initAPI( wpcom );

		client = new RestClient();
		client.global = globalData;
		client.sendMessage = receiveMessage;

		/**
		 * Initialize store with actions that need to occur on
		 * transitions from open to close or close to open
		 *
		 * @TODO: Pass this information directly into the Redux initial state
		 */
		store.dispatch( { type: SET_IS_SHOWING, isShowing } );
	}

	componentDidMount() {
		store.dispatch( { type: 'APP_IS_READY' } );
	}

	UNSAFE_componentWillReceiveProps( { isShowing, isVisible, wpcom } ) {
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
	}

	render() {
		return (
			<Provider store={ store }>
				<Layout
					{ ...{
						client,
						data: globalData,
						global: globalData,
						isShowing: this.props.isShowing,
						locale: this.props.locale,
					} }
				/>
			</Provider>
		);
	}
}

export default Notifications;
