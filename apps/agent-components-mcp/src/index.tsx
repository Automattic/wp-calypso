import { SurfaceRenderer } from '@automattic/agent-components';
import { App } from '@modelcontextprotocol/ext-apps';
import { Component, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { createMcpComponentSession } from './bridge';
import { applyHostContext } from './host-context';
import type { ComponentSession } from '@automattic/agent-components';
import type { ReactNode } from 'react';
import '@automattic/agent-components/style.css';
import './style.css';

const element = document.getElementById( 'root' );
if ( ! element ) {
	throw new Error( 'The action container is unavailable.' );
}
const root = createRoot( element );
const app = new App(
	{ name: 'WordPress.com agent components', version: '0.1.0' },
	{},
	{ strict: true, autoResize: true }
);
let session: ComponentSession | undefined;
let receivedResult = false;
let tornDown = false;
let hostLocale: string | undefined;
const messages = {
	unavailable: 'This action is unavailable. Return to the conversation for help.',
	hostUnavailable: 'This host cannot display this action. Return to the conversation for help.',
	loading: 'Loading the action…',
	cancelled: 'This action was cancelled.',
	connectionFailed: 'The host connection failed. Return to the conversation for help.',
	connectionClosed: 'The host connection closed. Return to the conversation for help.',
	compatibleHost: 'Open this action in a compatible MCP Apps conversation.',
};
let fallbackMessage: keyof typeof messages | undefined;

function fallback( message: keyof typeof messages ) {
	fallbackMessage = message;
	if ( ! tornDown ) {
		root.render( <p role="status">{ messages[ message ] }</p> );
	}
}

class PresentationBoundary extends Component<
	{ children: ReactNode; session: ComponentSession },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch() {
		this.props.session.failPresentation();
	}

	render() {
		return this.state.failed ? <p role="status">{ messages.unavailable }</p> : this.props.children;
	}
}

function ComponentCard( { controller }: { controller: ComponentSession } ) {
	const snapshot = useSyncExternalStore( controller.subscribe, controller.getSnapshot );
	if ( ! snapshot.result ) {
		return <p role="status">{ snapshot.error ?? messages.unavailable }</p>;
	}
	return (
		<>
			<SurfaceRenderer
				surface={ snapshot.result.surface }
				disabled={ snapshot.phase !== 'ready' }
				onAction={ controller.submit }
			/>
			{ snapshot.phase === 'pending' && <p role="status">Submitting…</p> }
			{ snapshot.error && <p role="alert">{ snapshot.error }</p> }
		</>
	);
}

function renderSession( controller: ComponentSession ) {
	fallbackMessage = undefined;
	root.render(
		<PresentationBoundary session={ controller }>
			<ComponentCard controller={ controller } />
		</PresentationBoundary>
	);
}

function updateTheme() {
	if ( tornDown ) {
		return;
	}
	const context = applyHostContext( app.getHostContext() );
	hostLocale = context.locale;
	session?.updateLocale( hostLocale );
	if ( fallbackMessage ) {
		fallback( fallbackMessage );
	} else if ( session ) {
		renderSession( session );
	}
}

app.ontoolresult = ( response ) => {
	if ( receivedResult ) {
		return;
	}
	receivedResult = true;
	try {
		hostLocale = applyHostContext( app.getHostContext() ).locale;
		if ( response.isError ) {
			throw new Error( messages.unavailable );
		}
		session = createMcpComponentSession( response.structuredContent, app, hostLocale );
		renderSession( session );
	} catch {
		fallback( 'unavailable' );
	}
};
app.onhostcontextchanged = updateTheme;
app.ontoolcancelled = () => {
	receivedResult = true;
	session?.failPresentation();
	fallback( 'cancelled' );
};
app.onteardown = () => {
	receivedResult = true;
	tornDown = true;
	session?.dispose();
	root.unmount();
	return {};
};
app.onerror = () => {
	receivedResult = true;
	session?.failPresentation();
	if ( ! session ) {
		fallback( 'connectionFailed' );
	}
};
app.onclose = () => {
	receivedResult = true;
	session?.failPresentation();
	if ( ! session ) {
		fallback( 'connectionClosed' );
	}
};

fallback( 'loading' );
if ( window.parent === window ) {
	fallback( 'compatibleHost' );
} else {
	app
		.connect( undefined, { timeout: 10000 } )
		.then( updateTheme )
		.catch( () => {
			receivedResult = true;
			fallback( 'hostUnavailable' );
		} );
}
