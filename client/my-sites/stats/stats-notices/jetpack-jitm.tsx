import React, { memo, useEffect } from 'react';

declare global {
	interface Window {
		hasRunJetpackJITM?: boolean;
		jitm_config?: {
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

		if ( ! window.jitm_config ) {
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

		return () => {
			// Stop JITM script from running again.
			window.hasRunJetpackJITM = true;
		};

		// No cleanup function to ensure script and CSS remain loaded
	}, [] );

	return (
		<div
			id="jp-admin-notices"
			className="jetpack-jitm-message"
			data-message-path="wp:jetpack_page_stats:admin_notices"
			data-query="page=stats"
			data-nonce={ window.jitm_config?.nonce }
		/>
	);
};

// Use React.memo to prevent unnecessary re-renders
export default memo( JetpackJITM, () => true );
