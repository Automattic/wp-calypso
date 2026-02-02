import { resolveRemoteBlueprint } from '@wp-playground/blueprints';
import type { Blueprint } from '@wp-playground/client';

const BLUEPRINT_LIB_HOST = 'blueprintlibrary.wordpress.com';

export async function resolveBlueprintFromURL( url: URL ): Promise< Blueprint > {
	const query = url.searchParams;

	// We keep the blueprint-url query arg for ease in testing things out
	// Actual prod use would be routed through blueprint library, at which point this will be removed
	if ( query.has( 'blueprint-url' ) ) {
		const url = query.get( 'blueprint-url' )!;
		// eslint-disable-next-line no-console
		console.warn(
			'Loading blueprint from ' +
				url +
				' but please migrate to using blueprint library ' +
				' (https://' +
				BLUEPRINT_LIB_HOST +
				')'
		);
		try {
			return resolveRemoteBlueprint( url );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( error );
			throw new Error( 'Failed to load blueprint from supplied URL: ' + url );
		}
	}

	if ( query.has( 'blueprint' ) ) {
		const blueprintId = Number( query.get( 'blueprint' ) );
		if ( ! isNaN( blueprintId ) ) {
			const blueprintUrl = `https://${ BLUEPRINT_LIB_HOST }?blueprint=${ blueprintId }`;
			try {
				return resolveRemoteBlueprint( blueprintUrl );
			} catch ( error ) {
				throw new Error( 'Failed to load blueprint from blueprint library: ' + blueprintUrl );
			}
		}
	}

	throw new Error( 'No valid blueprint parameter found in URL' );
}
