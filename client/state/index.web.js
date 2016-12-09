/**
 * External dependencies
 */
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware, compose } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isSupportUserSession } from 'lib/user/support-user-interop';
import statePersistenceEnhancer from 'lib/state-persistence';
import noticesMiddleware from './notices/middleware';
import consoleDispatcher from './console-dispatch';
import { analyticsMiddleware } from './analytics/middleware';
import { middleware as apiMiddleware } from './data-layer/wpcom-api-middleware';
import { SERIALIZE, DESERIALIZE } from './action-types';
import { isEnabled } from 'config';
import reducer from './reducer';

export default function createReduxStore( initialState ) {
	const middleware = [ thunkMiddleware, noticesMiddleware, analyticsMiddleware, apiMiddleware ];
	const enhancers = [ applyMiddleware( ...middleware ) ];

	if ( isEnabled( 'persist-redux' ) && ! isSupportUserSession() ) {
		const statePersistence = statePersistenceEnhancer( {
			types: { SERIALIZE, DESERIALIZE }
		} );

		enhancers.push( statePersistence );
	}

	if ( get( window.app, 'isDebug' ) ) {
		enhancers.push( consoleDispatcher );
	}

	if ( window.devToolsExtension ) {
		enhancers.push( window.devToolsExtension() );
	}

	return compose( ...enhancers )( createStore )( reducer, initialState );
}
