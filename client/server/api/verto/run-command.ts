import type { Request, Response } from 'express';

function writeLine( res: Response, obj: Record< string, unknown > ) {
	if ( ! res.writableEnded ) {
		try {
			res.write( JSON.stringify( obj ) + '\n' );
		} catch {
			// client disconnected
		}
	}
}

/**
 * POST /api/verto/run-command
 * Body: { command: string }
 * Only available when env_id === 'development'.
 * Streams command stdout/stderr as NDJSON. Kills the child process when the
 * client disconnects (e.g. via AbortController.abort()).
 */
export default function runCommand( req: Request, res: Response ): void {
	const command = req.body?.command;

	if ( typeof command !== 'string' || ! command.trim() ) {
		res.status( 400 ).json( { error: 'Missing or invalid "command" in body' } );
		return;
	}

	const trimmed = command.trim();

	res.writeHead( 200, {
		'Content-Type': 'application/x-ndjson',
		'Transfer-Encoding': 'chunked',
		'Cache-Control': 'no-cache',
		Connection: 'keep-alive',
	} );

	// Use runtime require to avoid webpack shimming child_process
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const cp = require( 'node:child_process' );

	let child;
	try {
		child = cp.spawn( '/bin/sh', [ '-c', trimmed ], {
			stdio: [ 'ignore', 'pipe', 'pipe' ],
			env: process.env,
		} );
	} catch ( spawnErr: unknown ) {
		const msg = spawnErr instanceof Error ? spawnErr.message : String( spawnErr );
		writeLine( res, { t: 'end', code: 1, error: `spawn failed: ${ msg }` } );
		res.end();
		return;
	}

	if ( ! child || ! child.stdout || ! child.stderr ) {
		writeLine( res, { t: 'end', code: 1, error: 'spawn returned no streams' } );
		res.end();
		return;
	}

	child.stdout.on( 'data', ( chunk: Buffer ) => {
		writeLine( res, { t: 'out', d: chunk.toString() } );
	} );

	child.stderr.on( 'data', ( chunk: Buffer ) => {
		writeLine( res, { t: 'err', d: chunk.toString() } );
	} );

	child.on( 'close', ( code: number | null, signal: string | null ) => {
		writeLine( res, {
			t: 'end',
			code: code ?? ( signal ? 1 : 0 ),
			signal: signal ?? undefined,
		} );
		if ( ! res.writableEnded ) {
			res.end();
		}
	} );

	child.on( 'error', ( err: Error ) => {
		writeLine( res, { t: 'end', code: 1, error: err.message } );
		if ( ! res.writableEnded ) {
			res.end();
		}
	} );

	res.on( 'close', () => {
		try {
			child.kill( 'SIGTERM' );
		} catch {
			// already dead
		}
	} );
}
