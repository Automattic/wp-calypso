import wpcom from 'calypso/lib/wp';

// trigger guides on step movement, we don't care about failures or response
export function triggerGuidesForStep( flowName: string, stepName?: string ) {
	wpcom.req
		.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: stepName,
			}
		)
		.then()
		.catch();
}
