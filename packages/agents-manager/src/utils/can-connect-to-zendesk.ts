let cachedPromise: Promise< boolean > | null = null;

export function canConnectToZendesk() {
	// Parse the JSON to throw errors for all non-success responses
	return (
		cachedPromise ||
		( cachedPromise = fetch( 'https://wpcom.zendesk.com/embeddable/config' )
			.then( ( res ) => res.json() )
			.then( ( data ) => !! data )
			.catch( () => false ) )
	);
}
