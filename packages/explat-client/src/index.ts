import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
} from './create-explat-client';
import { ExperimentAssignment } from './types';
import type { ExPlatClient } from './create-explat-client';
import type { Config, FeatureAssignmentBeacon } from './types';

const createExPlatClient =
	typeof window === 'undefined' ? createSsrSafeDummyExPlatClient : createBrowserExPlatClient;

export { createExPlatClient };
export type { ExPlatClient, ExperimentAssignment, Config, FeatureAssignmentBeacon };

export * as ExPlatSdk from './sdk';
