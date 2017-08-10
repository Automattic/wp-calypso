/** @format */
import Dispatcher from 'dispatcher';
import React from 'react';
import { find, identity, isFunction } from 'lodash';

const firstCallable = ( ...args ) => find( args, isFunction );
const mergeProps = ( ...args ) => Object.assign( {}, ...args );

const dispatchObject = action => Dispatcher.handleViewAction( action );
const dispatchThunk = thunk => thunk( dispatchObject );

const dispatch = action =>
	isFunction( action ) ? dispatchThunk( action ) : dispatchObject( action );

export const connectDispatcher = ( fromState, fromDispatch ) => Component => props =>
	React.createElement(
		Component,
		mergeProps(
			props,
			firstCallable( fromState, identity )( {} ),
			firstCallable( fromDispatch, identity )( dispatch )
		),
		props.children
	);
