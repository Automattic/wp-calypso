import fs from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { getLogger } from 'calypso/server/lib/logger';

const logger = getLogger();

const DEFAULT_MODEL = 'gpt-realtime';
const ALLOWED_MODELS = new Set( [
	'gpt-realtime',
	'gpt-realtime-1.5',
	'gpt-4o-realtime-preview',
	'gpt-4o-realtime-preview-2024-12-17',
	'gpt-4o-mini-realtime-preview',
] );

let dotenvLoaded = false;

/**
 * Calypso's server doesn't load .env automatically. This lazily parses
 * the repo-root .env file the first time the endpoint is called so that
 * OPENAI_API_KEY is available without requiring the user to export it.
 */
function loadEnvIfNeeded() {
	if ( dotenvLoaded ) {
		return;
	}
	dotenvLoaded = true;

	if ( process.env.OPENAI_API_KEY ) {
		return;
	}

	try {
		const envPath = path.resolve( process.cwd(), '.env' );
		if ( ! fs.existsSync( envPath ) ) {
			return;
		}
		const contents = fs.readFileSync( envPath, 'utf8' );
		for ( const rawLine of contents.split( /\r?\n/ ) ) {
			const line = rawLine.trim();
			if ( ! line || line.startsWith( '#' ) ) {
				continue;
			}
			const eq = line.indexOf( '=' );
			if ( eq === -1 ) {
				continue;
			}
			const key = line.slice( 0, eq ).trim();
			let value = line.slice( eq + 1 ).trim();
			if (
				( value.startsWith( '"' ) && value.endsWith( '"' ) ) ||
				( value.startsWith( "'" ) && value.endsWith( "'" ) )
			) {
				value = value.slice( 1, -1 );
			}
			if ( key && ! ( key in process.env ) ) {
				process.env[ key ] = value;
			}
		}
	} catch ( err ) {
		logger.warn( { err }, 'Failed to load .env for OpenAI Realtime token endpoint' );
	}
}

async function mintClientSecret( { apiKey, model } ) {
	// The /v1/realtime/client_secrets endpoint only accepts { session: { type, model } }.
	// Voice and instructions are set later by the client via a `session.update`
	// event over the data channel once the WebRTC connection is open.
	const response = await fetch( 'https://api.openai.com/v1/realtime/client_secrets', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${ apiKey }`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify( {
			session: {
				type: 'realtime',
				model,
			},
		} ),
	} );

	const text = await response.text();
	let data = null;
	try {
		data = text ? JSON.parse( text ) : null;
	} catch {
		data = null;
	}

	if ( ! response.ok ) {
		const message = data?.error?.message || text || `OpenAI error ${ response.status }`;
		const err = new Error( message );
		err.status = response.status;
		throw err;
	}

	return data;
}

function handler( req, res ) {
	loadEnvIfNeeded();

	// This endpoint exposes the ability to spend your OpenAI quota. Only enable in development.
	if ( process.env.NODE_ENV !== 'development' ) {
		return res.status( 404 ).json( { error: 'Not found' } );
	}

	const apiKey = process.env.OPENAI_API_KEY;
	if ( ! apiKey ) {
		return res
			.status( 500 )
			.json( { error: 'OPENAI_API_KEY is not set. Add it to your repo-root .env file.' } );
	}

	const requestedModel = ( req.body && req.body.model ) || DEFAULT_MODEL;
	const model = ALLOWED_MODELS.has( requestedModel ) ? requestedModel : DEFAULT_MODEL;

	mintClientSecret( { apiKey, model } )
		.then( ( data ) => {
			// Normalize the response into `{ client_secret: { value, expires_at } }`
			// so the client hook has a single shape to parse regardless of which
			// OpenAI API variant we called.
			const value = data?.value ?? data?.client_secret?.value;
			const expiresAt = data?.expires_at ?? data?.client_secret?.expires_at;
			if ( ! value ) {
				throw new Error( 'OpenAI response did not include a client secret value.' );
			}
			res.status( 200 ).json( {
				client_secret: { value, expires_at: expiresAt },
				model,
			} );
		} )
		.catch( ( err ) => {
			logger.error(
				{ err: { message: err.message, status: err.status } },
				'Failed to mint OpenAI Realtime client_secret'
			);
			res
				.status( err.status && err.status < 500 ? err.status : 502 )
				.json( { error: err.message || 'Failed to mint client_secret' } );
		} );
}

export default function ( app ) {
	return app.post( '/openai/realtime-token', bodyParser.json( { limit: '32kb' } ), handler );
}
