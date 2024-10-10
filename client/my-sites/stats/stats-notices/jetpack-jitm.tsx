import React, { memo, useEffect, useRef, useState } from 'react';

declare global {
	interface Window {
		initJetpackJITM?: () => void;
		hasRunJetpackJITM?: boolean;
		capturedJetpackJITMContent?: string;
		jitm_config?: {
			nonce: string;
			base_url: string;
			version: string;
		};
	}
}

const JetpackJITM: React.FC = () => {
	const [ isInitialized, setIsInitialized ] = useState( false );
	const jitmRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( window.hasRunJetpackJITM || window.capturedJetpackJITMContent ) {
			setIsInitialized( true );
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
		script.onload = () => {
			setIsInitialized( true );
		};
		document.body.appendChild( script );

		return () => {
			// Stop JITM script from running again.
			window.hasRunJetpackJITM = true;
		};

		// No cleanup function to ensure script and CSS remain loaded
	}, [] );

	useEffect( () => {
		if ( isInitialized && jitmRef.current && ! window.capturedJetpackJITMContent ) {
			const observer = new MutationObserver( () => {
				if ( jitmRef.current && jitmRef.current.children.length > 0 ) {
					// Capture the content
					window.capturedJetpackJITMContent = jitmRef.current.innerHTML;
					observer.disconnect();
				}
			} );

			observer.observe( jitmRef.current, { childList: true, subtree: true } );

			return () => observer.disconnect();
		}
	}, [ isInitialized ] );

	if ( window.capturedJetpackJITMContent ) {
		return (
			<div
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ {
					__html: window.capturedJetpackJITMContent as unknown as TrustedHTML,
				} }
			/>
		);
	}

	return (
		<div
			ref={ jitmRef }
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
