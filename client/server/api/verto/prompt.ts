import type { Request, Response } from 'express';

const ALLOWED_IPS = new Set( [ '80.238.97.23', '45.121.182.251', '127.0.0.1', '::1' ] );

function getClientIp( req: Request ): string {
	const forwarded = req.headers[ 'x-forwarded-for' ];
	const ip = forwarded
		? String( forwarded ).split( ',' )[ 0 ].trim()
		: req.socket?.remoteAddress ?? '';
	return ip.replace( /^::ffff:/, '' );
}

/**
 * POST /api/verto/prompt
 *
 * Body: { prompt: string, sessionId?: string }
 * Response: JSON output from `claude -p "..." --output-format json [--session-id <id>]`
 *
 * The response includes a session_id which the client should send back
 * in subsequent requests to continue the same conversation.
 */
export default function handlePrompt( req: Request, res: Response ) {
	const clientIp = getClientIp( req );
	if ( ! ALLOWED_IPS.has( clientIp ) ) {
		res.status( 403 ).json( { error: 'Forbidden' } );
		return;
	}

	const { prompt, sessionId } = req.body ?? {};

	if ( typeof prompt !== 'string' || ! prompt.trim() ) {
		res.status( 400 ).json( { error: 'prompt is required' } );
		return;
	}

	const args = [ '-p', prompt.trim(), '--output-format', 'json', '--dangerously-skip-permissions' ];
	if ( sessionId && typeof sessionId === 'string' ) {
		args.push( '--resume', sessionId );
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { spawn } = require( 'child_process' );
	const child = spawn( 'claude', args, {
		cwd: process.cwd(),
		env: { ...process.env, TERM: 'dumb' },
		stdio: [ 'ignore', 'pipe', 'pipe' ],
	} );

	let stdout = '';
	let stderr = '';

	child.stdout.on( 'data', ( chunk: Buffer ) => {
		stdout += chunk.toString();
	} );

	child.stderr.on( 'data', ( chunk: Buffer ) => {
		stderr += chunk.toString();
	} );

	res.on( 'close', () => {
		try {
			child.kill( 'SIGTERM' );
		} catch {
			// already dead
		}
	} );

	child.on( 'close', ( code: number | null ) => {
		if ( res.writableEnded ) {
			return;
		}

		if ( code !== 0 ) {
			res.status( 500 ).json( { error: stderr || `claude exited with code ${ code }` } );
			return;
		}

		try {
			const parsed = JSON.parse( stdout );
			res.json( parsed );
		} catch {
			res.status( 500 ).json( { error: 'Failed to parse claude output', raw: stdout } );
		}
	} );

	child.on( 'error', ( err: Error ) => {
		if ( ! res.writableEnded ) {
			res.status( 500 ).json( { error: err.message } );
		}
	} );
}
