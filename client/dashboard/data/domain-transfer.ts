import wpcom from 'calypso/lib/wp';

export async function updateDomainLock( domain: string, enabled: boolean ): Promise< void > {
	return wpcom.req.post( {
		path: `/domains/${ domain }/transfer`,
		apiNamespace: 'wpcom/v2',
		body: {
			domainStatus: JSON.stringify( {
				command: enabled ? 'lock' : 'unlock',
			} ),
		},
	} );
}
