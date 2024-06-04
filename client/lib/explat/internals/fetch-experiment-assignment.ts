import { isE2ETest } from 'calypso/lib/e2e';
import wpcom from 'calypso/lib/wp';

// SSR safety: Fail TypeScript compilation if `window` is used without an explicit undefined check
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const window: undefined | ( Window & typeof globalThis );

export default function fetchExperimentAssignment( {
	experimentName,
	anonId,
}: {
	experimentName: string;
	anonId: string | null;
} ): Promise< unknown > {
	if ( isE2ETest() ) {
		return new Promise( ( resolve ) => {
			resolve( {
				variations: {
					[ experimentName ]: null,
				},
				ttl: 60,
			} );
		} );
	}

	return wpcom.req.get(
		{
			path: '/experiments/0.1.0/assignments/calypso',
			apiNamespace: 'wpcom/v2',
		},
		{
			experiment_name: experimentName,
			anon_id: anonId ?? undefined,
		}
	);
}
