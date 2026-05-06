import wpcom from 'calypso/lib/wp';
import type { FeatureAssignmentBeacon } from '@automattic/explat-client';

// SSR safety: Fail TypeScript compilation if `window` is used without an explicit undefined check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const window: undefined | ( Window & typeof globalThis );

export default function logFeatureAssignment( body: FeatureAssignmentBeacon ): Promise< void > {
	return wpcom.req.post(
		{
			path: '/experiments/0.1.0/assignments/log',
			apiNamespace: 'wpcom/v2',
		},
		body
	);
}
