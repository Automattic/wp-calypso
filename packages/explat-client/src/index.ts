/**
 * Internal dependencies
 */
import { ExperimentAssignment } from './types';
import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
	ExPlatClient,
} from './create-explat-client';

const createExPlatClient =
	typeof window === 'undefined' ? createSsrSafeDummyExPlatClient : createBrowserExPlatClient;

export { createExPlatClient, ExperimentAssignment, ExPlatClient };
