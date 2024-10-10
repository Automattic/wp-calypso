import { memo, useEffect } from 'react';

declare global {
	interface Window {
		initJetpackJITM: () => void;
		hasRunJetpackJITM: boolean;
		jitm_config: {
			nonce: string;
			base_url: string;
			version: string;
		};
	}
}

const JetpackJITM: React.FC = () => {
	useEffect( () => {
		if ( window.hasRunJetpackJITM ) {
			return;
		}
		// Load CSS
		const link: HTMLLinkElement = document.createElement( 'link' );
		link.href = `${ window.jitm_config.base_url }/build/index.css?ver=${ window.jitm_config.version }&minify=false`;
		link.rel = 'stylesheet';
		document.head.appendChild( link );

		// Load JavaScript
		const script: HTMLScriptElement = document.createElement( 'script' );
		script.src = `${ window.jitm_config.base_url }/build/index.js?ver=${ window.jitm_config.version }&minify=false`;
		script.async = true;
		document.body.appendChild( script );

		// Cleanup function
		return () => {
			document.head.removeChild( link );
			document.body.removeChild( script );
			// Stop JITM from running again if the component is re-rendered.
			window.hasRunJetpackJITM = true;
		};
	}, [] ); // Empty dependency array ensures this runs only once on mount

	return (
		<div
			id="jp-admin-notices"
			className="jetpack-jitm-message"
			data-message-path="wp:jetpack_page_stats:admin_notices"
			data-query="page=stats"
			data-nonce={ window.jitm_config.nonce }
		></div>
	);
};

export default memo( JetpackJITM, () => true );
