import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { loadSiteSpecScript, loadSiteSpecCSS, getSiteSpecConfig } from 'calypso/lib/site-spec';
import type { Step as StepType } from '../../types';

interface SiteSpecMessage {
	type: string;
	data?: unknown;
	timestamp?: number;
}
interface SiteSpecError {
	message: string;
	code?: string | number;
	stack?: string;
}
interface SiteSpecConfig {
	container: string | HTMLElement;
	agentUrl?: string;
	agentId?: string;
	buildSiteUrl?: string;
	authProvider?: () => Promise< { Authorization: string } >;
	onMessage?: ( message: SiteSpecMessage ) => void;
	onError?: ( error: SiteSpecError ) => void;
}
interface SiteSpecInstance {
	destroy: () => void;
}

declare global {
	interface Window {
		SiteSpec?: {
			init: ( config: SiteSpecConfig ) => SiteSpecInstance;
		};
	}
}

const INIT_TIMEOUT_MS = 5000;
const POLL_MS = 100;

const LearningStep: StepType = function LearningStep() {
	const translate = useTranslate();
	const siteSpecInstanceRef = useRef< SiteSpecInstance | null >( null );
	const containerRef = useRef< HTMLDivElement >( null );

	const handleSiteSpecMessage = useCallback( ( message: SiteSpecMessage ) => {
		// TODO: replace with real routing/handling by message.type
		// eslint-disable-next-line no-console
		console.log( 'SiteSpec message:', message );
	}, [] );

	const handleSiteSpecError = useCallback( ( error: SiteSpecError ) => {
		// TODO: surface to user toast, Sentry, etc.
		// eslint-disable-next-line no-console
		console.error( 'SiteSpec error:', error );
	}, [] );

	useEffect( () => {
		// Avoid duplicate init on hot reload or prop changes.
		if ( siteSpecInstanceRef.current ) {
			return;
		}

		let cancelled = false;
		let pollId: number | undefined;
		let timeoutId: number | undefined;

		const initialize = async () => {
			try {
				try {
					await loadSiteSpecCSS();
				} catch ( cssErr ) {
					// eslint-disable-next-line no-console
					console.warn( 'SiteSpec CSS failed to load; continuing:', cssErr );
				}

				await loadSiteSpecScript();

				// Wait until window.SiteSpec?.init is available, or time out.
				await new Promise< void >( ( resolve, reject ) => {
					if ( typeof window === 'undefined' ) {
						reject( new Error( 'Window is undefined (likely SSR)' ) );
						return;
					}

					const hasInit = () => !! window.SiteSpec?.init;

					if ( hasInit() ) {
						resolve();
						return;
					}

					pollId = window.setInterval( () => {
						if ( hasInit() ) {
							if ( timeoutId ) {
								window.clearTimeout( timeoutId );
							}
							if ( pollId ) {
								window.clearInterval( pollId );
							}
							resolve();
						}
					}, POLL_MS );

					timeoutId = window.setTimeout( () => {
						if ( pollId ) {
							window.clearInterval( pollId );
						}
						reject( new Error( 'SiteSpec script initialization timeout' ) );
					}, INIT_TIMEOUT_MS );
				} );

				if ( cancelled ) {
					return;
				}
				if ( ! containerRef.current ) {
					throw new Error( 'Missing containerRef' );
				}
				if ( ! window.SiteSpec?.init ) {
					throw new Error( 'SiteSpec.init not available' );
				}

				const config = getSiteSpecConfig();

				// Spread config to avoid drift; override handlers/container explicitly.
				const instance = window.SiteSpec.init( {
					...config,
					container: containerRef.current,
					onMessage: handleSiteSpecMessage,
					onError: handleSiteSpecError,
				} );

				siteSpecInstanceRef.current = instance;
			} catch ( err ) {
				if ( ! cancelled ) {
					// eslint-disable-next-line no-console
					console.error( 'Failed to initialize SiteSpec:', err );
					handleSiteSpecError( {
						message: err instanceof Error ? err.message : 'Unknown SiteSpec init error',
						stack: err instanceof Error ? err.stack : undefined,
					} );
				}
			}
		};

		void initialize();

		return () => {
			cancelled = true;
			if ( timeoutId ) {
				window.clearTimeout( timeoutId );
			}
			if ( pollId ) {
				window.clearInterval( pollId );
			}
			try {
				siteSpecInstanceRef.current?.destroy?.();
			} finally {
				siteSpecInstanceRef.current = null;
			}
		};
	}, [ handleSiteSpecError, handleSiteSpecMessage ] );

	return (
		<>
			<DocumentHead title={ translate( 'Build Your Site with AI' ) } />
			<div ref={ containerRef } id="site-spec" />
		</>
	);
};

export default LearningStep;
