import {
	createExPlatClient as createBrowserExPlatClient,
	createSsrSafeDummyExPlatClient,
} from './create-explat-client';
import { ExperimentAssignment } from './types';
import type { ExPlatClient, LoadExperimentAssignmentOptions } from './create-explat-client';
import type { AssignmentIdentity, Config, FeatureAssignmentBeacon } from './types';

const createExPlatClient =
	typeof window === 'undefined' ? createSsrSafeDummyExPlatClient : createBrowserExPlatClient;

export { createExPlatClient };
export type {
	ExPlatClient,
	ExperimentAssignment,
	Config,
	FeatureAssignmentBeacon,
	AssignmentIdentity,
	LoadExperimentAssignmentOptions,
};

export * as ExPlatSdk from './sdk';
