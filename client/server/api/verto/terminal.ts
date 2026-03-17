import type { Server } from 'http';
import type { Server as HttpsServer } from 'https';

/**
 * Attaches a WebSocket server at /api/verto/terminal that spawns
 * a PTY and pipes I/O bidirectionally. Development only.
 *
 * Protocol (JSON over WebSocket):
 *   Client → Server:
 *     { type: "input", data: string }     – keystrokes
 *     { type: "resize", cols: N, rows: N } – terminal resize
 *   Server → Client:
 *     { type: "output", data: string }     – PTY output
 *     { type: "exit", code: number }       – PTY exited
 */
export default function attachTerminalWebSocket( server: Server | HttpsServer ) {
	// Runtime require to avoid webpack bundling native modules
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const WebSocket = require( 'ws' );
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const pty = require( 'node-pty' );

	const WsServer = WebSocket.Server || WebSocket.WebSocketServer;
	const wss = new WsServer( { noServer: true } );

	const ALLOWED_IPS = new Set( [ '80.238.97.23', '45.121.182.251', '127.0.0.1', '::1' ] );

	server.on( 'upgrade', ( req: any, socket: any, head: unknown ) => {
		const url = req.url ?? '';
		if ( ! url.startsWith( '/api/verto/terminal' ) ) {
			return;
		}

		const forwarded = req.headers?.[ 'x-forwarded-for' ];
		const ip = forwarded
			? String( forwarded ).split( ',' )[ 0 ].trim()
			: socket?.remoteAddress ?? '';
		const normalizedIp = ip.replace( /^::ffff:/, '' );

		if ( ! ALLOWED_IPS.has( normalizedIp ) ) {
			socket.write( 'HTTP/1.1 403 Forbidden\r\n\r\n' );
			socket.destroy();
			return;
		}

		wss.handleUpgrade( req, socket, head, ( ws: unknown ) => {
			wss.emit( 'connection', ws, req );
		} );
	} );

	wss.on( 'connection', ( ws: WebSocket ) => {
		const cwd = process.cwd();
		const home = process.env.HOME || cwd;

		let term;
		try {
			term = pty.spawn( 'claude', [], {
				name: 'xterm-256color',
				cols: 120,
				rows: 30,
				cwd,
				env: {
					...process.env,
					TERM: 'xterm-256color',
					HOME: home,
				},
			} );
		} catch ( err: unknown ) {
			const msg = err instanceof Error ? err.message : String( err );
			console.error( 'Failed to spawn claude:', msg );
			try {
				( ws as any ).send(
					JSON.stringify( { type: 'output', data: `\r\nFailed to start claude: ${ msg }\r\n` } )
				);
				( ws as any ).close();
			} catch {
				// ignore
			}
			return;
		}

		term.onData( ( data: string ) => {
			try {
				if ( ( ws as any ).readyState === 1 ) {
					( ws as any ).send( JSON.stringify( { type: 'output', data } ) );
				}
			} catch {
				// client gone
			}
		} );

		term.onExit( ( { exitCode }: { exitCode: number } ) => {
			try {
				if ( ( ws as any ).readyState === 1 ) {
					( ws as any ).send( JSON.stringify( { type: 'exit', code: exitCode } ) );
				}
			} catch {
				// client gone
			}
			try {
				( ws as any ).close();
			} catch {
				// already closed
			}
		} );

		( ws as any ).on( 'message', ( raw: Buffer | string ) => {
			try {
				const msg = JSON.parse( typeof raw === 'string' ? raw : raw.toString() );
				if ( msg.type === 'input' && typeof msg.data === 'string' ) {
					term.write( msg.data );
				} else if (
					msg.type === 'resize' &&
					typeof msg.cols === 'number' &&
					typeof msg.rows === 'number'
				) {
					term.resize(
						Math.max( 1, Math.floor( msg.cols ) ),
						Math.max( 1, Math.floor( msg.rows ) )
					);
				}
			} catch {
				// ignore malformed messages
			}
		} );

		( ws as any ).on( 'close', () => {
			try {
				term.kill();
			} catch {
				// already dead
			}
		} );
	} );
}
