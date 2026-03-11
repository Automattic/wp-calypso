/**
 * Local type definitions for @wordpress/sync provider types.
 *
 * TODO: Remove this file and import directly from '@wordpress/sync' once
 * we upgrade to @wordpress/sync >= 1.41.0, which exports these types.
 * The current version (^1.23.0) does not include ProviderCreator,
 * ProviderCreatorResult, or ConnectionStatus in its public API.
 *
 * The upgrade is blocked by `@wordpress/block-editor` 14.18.0, which pins
 * `@wordpress/sync` to ^1.23.0 and causes a dependency resolution conflict
 * when a newer version is requested.
 */

import type { Awareness } from 'y-protocols/awareness';
import type * as Y from 'yjs';

/**
 * Connection error codes that can occur in sync providers.
 */
export type ConnectionErrorCode =
	| 'authentication-error'
	| 'connection-expired'
	| 'connection-limit-exceeded'
	| 'unknown-error';

/**
 * Sync connection error object.
 */
export interface ConnectionError extends Error {
	code: ConnectionErrorCode;
}

/**
 * Current connection status of a sync provider.
 */
export interface ConnectionStatusConnected {
	status: 'connected';
}
export interface ConnectionStatusConnecting {
	status: 'connecting';
}
export interface ConnectionStatusDisconnected {
	status: 'disconnected';
	error?: ConnectionError;
	retryInMs?: number;
}
export type ConnectionStatus =
	| ConnectionStatusConnected
	| ConnectionStatusConnecting
	| ConnectionStatusDisconnected;

/**
 * Event map for provider events.
 */
export interface ProviderEventMap {
	status: ConnectionStatus;
}

/**
 * Generic event listener type for providers.
 */
export type ProviderOn = < K extends keyof ProviderEventMap >(
	event: K,
	callback: ( data: ProviderEventMap[ K ] ) => void
) => void;

/**
 * Result returned by a provider creator function.
 */
export interface ProviderCreatorResult {
	destroy: () => void;
	on: ProviderOn;
}

/**
 * Options passed to a provider creator function.
 */
export interface ProviderCreatorOptions {
	objectType: string;
	objectId: string | null;
	ydoc: Y.Doc;
	awareness?: Awareness;
}

/**
 * A function that creates a sync provider for a given entity.
 */
export type ProviderCreator = (
	options: ProviderCreatorOptions
) => Promise< ProviderCreatorResult >;
