/**
 * External dependencies
 */
import { once } from 'lodash';
import fs from 'fs';
import path from 'path';
import Fuse from 'fuse.js';

const loadSearchIndex = once( async () => {
	const searchIndexPath = path.resolve(
		__dirname,
		'../../../../build/devdocs-selectors-index.json'
	);
	const searchIndex = await fs.promises.readFile( searchIndexPath, 'utf-8' );
	const selectors = JSON.parse( searchIndex );

	return new Fuse( selectors, {
		keys: [
			{ name: 'name', weight: 0.9 },
			{ name: 'description', weight: 0.1 },
		],
		threshold: 0.4,
		distance: 20,
	} );
} );

export default async function searchSelectors( request, response ) {
	try {
		const fuse = await loadSearchIndex();
		const results = request.query.search ? fuse.search( request.query.search ) : fuse.list;
		response.json( results );
	} catch ( error ) {
		response.status( 500 ).json( error );
	}
}
