/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	propExists,
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

export const isAvailable = propExists( 'available' );
export const isConnecting = propEquals( 'connectionStatus', 'connecting' );
export const isConnected = propEquals( 'connectionStatus', 'connected' );

export const timeline = when(
	isConnecting,
	renderLoading,
	( { onScrollContainer } ) => <Timeline onScrollContainer={ onScrollContainer } />
);

export const composer = when( isConnected, () => <Composer /> );
