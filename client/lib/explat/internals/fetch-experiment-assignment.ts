/**
 * WordPress dependencies
 */
import wpcom from 'calypso/lib/wp';

// Using typescript to ensure we are being safe in SSR
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const window: undefined | ( Window & typeof globalThis );

export default function fetchExperimentAssignment( {
	experimentName,
	anonId,
}: {
	experimentName: string;
	anonId: string | null;
} ): Promise< unknown > {
	return wpcom.req.get(
		{
			path: '/experiments/0.1.0/assignments/wpcom',
			apiNamespace: 'wpcom/v2',
		},
		{
			experiment_name: experimentName,
			anon_id: anonId ?? undefined,
		}
	);
}
