import { resolveRemoteBlueprint } from '@wp-playground/blueprints';
import type { Blueprint } from '@wp-playground/client';

const BLUEPRINT_LIB_HOST = 'blueprintlibrary.wordpress.com';

export async function resolveBlueprintFromURL( url: URL ): Promise< Blueprint > {
	const q = url.searchParams;
	let source: string | null = null;
	let deprecationWarn = false;

	if ( q.has( 'blueprint-url' ) ) {
		source = q.get( 'blueprint-url' )!;
		deprecationWarn = true;
	} else if ( q.has( 'blueprint' ) ) {
		const id = Number( q.get( 'blueprint' ) );
		if ( ! isNaN( id ) ) {
			source = `https://${ BLUEPRINT_LIB_HOST }?blueprint=${ id }`;
		}
	}

	if ( ! source ) {
		throw new Error( 'No valid blueprint parameter found in URL' );
	}

	if ( deprecationWarn ) {
		// eslint-disable-next-line no-console
		console.warn(
			`Loading blueprint from ${ source } but please migrate to blueprint library (https://${ BLUEPRINT_LIB_HOST })`
		);
	}

	try {
		return await resolveRemoteBlueprint( source );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( error );
		throw new Error( `Failed to load blueprint: ${ source }` );
	}
}
