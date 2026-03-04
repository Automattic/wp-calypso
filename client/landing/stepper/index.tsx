import config from '@automattic/calypso-config';
import { createRoot } from 'react-dom/client';
import { StepperApp } from './stepper-app';
import redirectPathIfNecessary from './utils/flow-redirect-handler';

declare const window: AppWindow;

interface AppWindow extends Window {
	BUILD_TARGET: string;
}

async function main() {
	const { pathname, search } = window.location;

	// Before proceeding we redirect the user if necessary.
	if ( redirectPathIfNecessary( pathname, search ) ) {
		return null;
	}
	// Sympathy mode clears cache randomly, Stepper uses the cache to persist state (not really a cache).
	config.enable( 'no-force-sympathy' );

	const root = createRoot( document.getElementById( 'wpcom' ) as HTMLElement );

	root.render( <StepperApp /> );
}

main();
