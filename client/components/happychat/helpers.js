/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	propEquals,
	when
} from './functional';
import Timeline from './timeline';
import Composer from './composer';
import Spinner from 'components/spinner';

/*
 * Renders a spinner in a flex-box context so it is centered vertically and horizontally
 */
const renderLoading = () => (
	<div className="happychat__loading">
		<Spinner />
	</div>
);

/*
 * Functions for determinining the state of happychat
 */
export const isConnecting = propEquals( 'connectionStatus', 'connecting' );
export const isConnected = propEquals( 'connectionStatus', 'connected' );
export const isMinimizing = propEquals( 'minimizingStatus', 'minimizing' );

/*
 * Renders the timeline once the happychat client has connected
 */
export const timeline = when(
	isConnecting,
	isMinimizing,
	renderLoading,
	( { onScrollContainer } ) => <Timeline onScrollContainer={ onScrollContainer } />
);

/**
Renders the message composer once happychat client is connected
 */
export const composer = when( isConnected, () => <Composer /> );
