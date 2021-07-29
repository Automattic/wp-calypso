import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
} from './create-explat-client';
import { ExperimentAssignment } from './types';
import type { ExPlatClient } from './create-explat-client';

const createExPlatClient =
	typeof window === 'undefined' ? createSsrSafeDummyExPlatClient : createBrowserExPlatClient;

export { createExPlatClient };
export type { ExPlatClient, ExperimentAssignment };
