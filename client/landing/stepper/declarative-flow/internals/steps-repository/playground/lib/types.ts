/**
 * Local type definitions for WordPress Playground.
 *
 * Minimal versions of types from `@wp-playground/client`,
 * `@wp-playground/blueprints`, and `@php-wasm/universal` packages — covering
 * only the subset used in this codebase.
 */

import type { BlueprintBundle } from './resolve-remote-blueprint-standalone';

export type { BlueprintBundle };

/**
 * PHP versions supported by WordPress Playground.
 */
export type SupportedPHPVersion = '8.5' | '8.4' | '8.3' | '8.2' | '8.1' | '8.0' | '7.4';

/**
 * The Blueprint declaration, typically stored in a blueprint.json file.
 */
export type BlueprintV1Declaration = {
	landingPage?: string;
	description?: string;
	meta?: {
		title: string;
		description?: string;
		author: string;
		categories?: string[];
	};
	preferredVersions?: {
		php: string;
		wp: string;
	};
	features?: {
		intl?: boolean;
		networking?: boolean;
	};
	extraLibraries?: 'wp-cli'[];
	constants?: Record< string, string | boolean | number >;
	plugins?: Array< string | unknown >;
	siteOptions?: Record< string, string > & { blogname?: string };
	login?: boolean | { username: string; password: string };
	phpExtensionBundles?: unknown;
	steps?: Array< unknown >;
};

/**
 * A BlueprintV1 is either a JSON declaration or a filesystem bundle.
 */
export type BlueprintV1 = BlueprintV1Declaration | BlueprintBundle;

/**
 * A Blueprint represents a WordPress Playground configuration.
 * In this codebase only V1 blueprints are used.
 */
export type Blueprint = BlueprintV1;

/**
 * Mount device configuration for WordPress Playground.
 */
export type MountDevice =
	| { type: 'opfs'; path: string }
	| { type: 'local-fs'; handle: FileSystemDirectoryHandle };

/**
 * Describes a filesystem mount for WordPress Playground.
 */
export interface MountDescriptor {
	mountpoint: string;
	device: MountDevice;
	initialSyncDirection: 'opfs-to-memfs' | 'memfs-to-opfs';
}

/**
 * Minimal interface for the WordPress Playground client.
 * Covers only the methods used in this codebase.
 */
export interface PlaygroundClient {
	isReady(): Promise< void >;
	run( options: { code: string } ): Promise< { text: string } >;
	mountOpfs( options: MountDescriptor ): Promise< void >;
}
