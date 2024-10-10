import { useEffect, useRef } from 'react';

declare global {
	interface Window {
		initJetpackJITM: () => void;
		jitm_config: {
			nonce: string;
		};
	}
}

const JetpackJITM: React.FC = () => {
	const jitmContainerRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		// Load CSS
		const link: HTMLLinkElement = document.createElement( 'link' );
		link.href =
			'https://ready-carp-caterpillar.jurassic.ninja/wp-content/plugins/jetpack/jetpack_vendor/automattic/jetpack-jitm/build/index.css';
		link.rel = 'stylesheet';
		document.head.appendChild( link );

		// Load JavaScript
		const script: HTMLScriptElement = document.createElement( 'script' );
		script.src =
			'https://ready-carp-caterpillar.jurassic.ninja/wp-content/plugins/jetpack/jetpack_vendor/automattic/jetpack-jitm/build/index.js';
		script.async = true;

		script.onload = () => {
			// Call reFetch after the script has loaded
			if ( window.initJetpackJITM ) {
				window.initJetpackJITM();
			}
		};

		document.body.appendChild( script );

		// Cleanup function
		return () => {
			document.head.removeChild( link );
			document.body.removeChild( script );
		};
	}, [] ); // Empty dependency array ensures this runs only once on mount

	return (
		<div
			ref={ jitmContainerRef }
			id="jp-admin-notices"
			className="jetpack-jitm-message"
			data-message-path="wp:jetpack_page_stats:admin_notices"
			data-query="page=stats"
			data-nonce={ window.jitm_config.nonce }
		></div>
	);
};

export default JetpackJITM;
