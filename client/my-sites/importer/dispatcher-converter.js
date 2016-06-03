import Dispatcher from 'dispatcher';
import React from 'react';
import identity from 'lodash/identity';
import isFunction from 'lodash/isFunction';

const ifCallableElse = ( f, g ) => isFunction( f ) ? f : g;
const mergeProps = ( ...args ) => Object.assign( {}, ...args );

const dispatchObject = action => Dispatcher.handleViewAction( action );
const dispatchThunk = thunk => thunk( dispatchObject );

const dispatch = action => isFunction( action )
	? dispatchThunk( action )
	: dispatchObject( action );

export const connectDispatcher = ( fromState, fromDispatch ) => Component => props => (
	React.createElement(
		Component,
		mergeProps(
			props,
			ifCallableElse( fromState, identity )( {} ),
			ifCallableElse( fromDispatch, identity )( dispatch )
		),
		props.children
	)
);
