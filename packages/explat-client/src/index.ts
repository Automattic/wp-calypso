/**
 * Internal dependencies
 */
import { ExperimentAssignment } from './types';
import createBrowserExPlatClient, { ExPlatClient } from './create-explat-client';
import createSsrSafeMockExPlatClient from './create-ssr-safe-mock-explat-client';

const createExPlatClient =
	typeof window === 'undefined' ? createSsrSafeMockExPlatClient : createBrowserExPlatClient;

export { createExPlatClient, ExperimentAssignment, ExPlatClient };
