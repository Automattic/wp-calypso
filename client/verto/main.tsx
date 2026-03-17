import { useRef, useEffect, useCallback } from 'react';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import '@xterm/xterm/css/xterm.css';
import './style.scss';

function getWsUrl(): string {
	const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${ proto }//${ window.location.host }/api/verto/terminal`;
}

export default function VertoMain() {
	const termContainerRef = useRef< HTMLDivElement | null >( null );
	const wsRef = useRef< WebSocket | null >( null );
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const termRef = useRef< any >( null );
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const fitAddonRef = useRef< any >( null );

	const connect = useCallback( async () => {
		const container = termContainerRef.current;
		if ( ! container ) {
			return;
		}

		const { Terminal } = await import( '@xterm/xterm' );
		const { FitAddon } = await import( '@xterm/addon-fit' );

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let WebglAddon: any = null;
		try {
			const mod = await import( '@xterm/addon-webgl' );
			WebglAddon = mod.WebglAddon;
		} catch {
			// WebGL not available, fall back to canvas renderer
		}

		const term = new Terminal( {
			cursorBlink: true,
			fontSize: 13,
			fontFamily: 'ui-monospace, "SF Mono", Menlo, Monaco, "Cascadia Code", monospace',
			theme: {
				background: '#1e1e2e',
				foreground: '#cdd6f4',
				cursor: '#f5e0dc',
				selectionBackground: '#585b7066',
				black: '#45475a',
				red: '#f38ba8',
				green: '#a6e3a1',
				yellow: '#f9e2af',
				blue: '#89b4fa',
				magenta: '#f5c2e7',
				cyan: '#94e2d5',
				white: '#bac2de',
				brightBlack: '#585b70',
				brightRed: '#f38ba8',
				brightGreen: '#a6e3a1',
				brightYellow: '#f9e2af',
				brightBlue: '#89b4fa',
				brightMagenta: '#f5c2e7',
				brightCyan: '#94e2d5',
				brightWhite: '#a6adc8',
			},
		} );

		const fitAddon = new FitAddon();
		term.loadAddon( fitAddon );
		term.open( container );

		if ( WebglAddon ) {
			try {
				term.loadAddon( new WebglAddon() );
			} catch {
				// WebGL init failed, continue with canvas
			}
		}

		fitAddon.fit();

		termRef.current = term;
		fitAddonRef.current = fitAddon;

		const ws = new WebSocket( getWsUrl() );
		wsRef.current = ws;

		ws.onopen = () => {
			ws.send(
				JSON.stringify( {
					type: 'resize',
					cols: term.cols,
					rows: term.rows,
				} )
			);
		};

		ws.onmessage = ( event ) => {
			try {
				const msg = JSON.parse( event.data );
				if ( msg.type === 'output' ) {
					term.write( msg.data );
				} else if ( msg.type === 'exit' ) {
					term.writeln( `\r\n\x1b[90m[Process exited with code ${ msg.code }]\x1b[0m` );
				}
			} catch {
				// ignore malformed messages
			}
		};

		ws.onclose = () => {
			term.writeln( '\r\n\x1b[90m[Connection closed]\x1b[0m' );
		};

		term.onData( ( data: string ) => {
			if ( ws.readyState === WebSocket.OPEN ) {
				ws.send( JSON.stringify( { type: 'input', data } ) );
			}
		} );

		term.onResize( ( { cols, rows }: { cols: number; rows: number } ) => {
			if ( ws.readyState === WebSocket.OPEN ) {
				ws.send( JSON.stringify( { type: 'resize', cols, rows } ) );
			}
		} );
	}, [] );

	useEffect( () => {
		connect();

		const handleResize = () => {
			if ( fitAddonRef.current ) {
				try {
					fitAddonRef.current.fit();
				} catch {
					// terminal not ready
				}
			}
		};

		window.addEventListener( 'resize', handleResize );

		return () => {
			window.removeEventListener( 'resize', handleResize );
			wsRef.current?.close();
			termRef.current?.dispose();
		};
	}, [ connect ] );

	return (
		<div className="verto-page">
			<PageViewTracker path="/verto" title="Calypso Agentic Framework" />
			<div className="verto-page__window">
				<iframe className="verto-page__iframe" src="/" title="Calypso" />
			</div>
			<aside className="verto-page__terminal">
				<div className="verto-page__terminal-header">
					<h2 className="verto-page__terminal-title">Terminal</h2>
				</div>
				<div className="verto-page__terminal-container" ref={ termContainerRef } />
			</aside>
		</div>
	);
}
