/**
 * Internal dependencies
 */
import { ExperimentAssignment } from './types';
import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
} from './create-explat-client';
import type { ExPlatClient } from './create-explat-client';

const createExPlatClient =
	typeof window === 'undefined' ? createSsrSafeDummyExPlatClient : createBrowserExPlatClient;

export { createExPlatClient, ExperimentAssignment };
export type { ExPlatClient };
