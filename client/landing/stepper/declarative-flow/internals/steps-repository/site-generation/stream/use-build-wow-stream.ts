import { useEffect, useState } from 'react';
import { logBuildWowEvent } from 'calypso/landing/stepper/utils/build-wow';
import { subscribeToBuildWowStream } from './subscribe';
import type { BuildWowStreamState } from './reducer';
import type { BuildWowStreamInfo } from './types';

export type BuildWowStreamView = {
	info: BuildWowStreamInfo;
	state: BuildWowStreamState;
};

/**
 * Follows the run the status endpoint advertises. A new run id starts over
 * from nothing, so a retried build never shows the previous run's plan. When
 * the feed stops, the last state stays on screen and status polling carries
 * on alone.
 */
export function useBuildWowStream( info: BuildWowStreamInfo | null ): BuildWowStreamView | null {
	const [ view, setView ] = useState< BuildWowStreamView | null >( null );

	useEffect( () => {
		setView( null );
		if ( ! info ) {
			return;
		}

		// Site-scoped: a Bearer for this blog, the WordPress.com OAuth token where
		// Calypso has one, otherwise a JWT minted through the proxy. Loaded on
		// demand so runs without a feed never pull in the agents-manager code.
		let authProvider: ( () => Promise< Record< string, string > > ) | undefined;
		const authorize = async () => {
			try {
				if ( ! authProvider ) {
					const { createCalypsoAuthProvider } =
						await import( '@automattic/agents-manager/src/auth/calypso-auth-provider' );
					authProvider = createCalypsoAuthProvider( info.blogId );
				}
				return ( await authProvider() ).Authorization ?? null;
			} catch {
				return null;
			}
		};

		const unsubscribe = subscribeToBuildWowStream( {
			info,
			authorize,
			onState: ( state ) => setView( { info, state } ),
			onStop: ( reason ) =>
				logBuildWowEvent(
					'site_generation_stream_stopped',
					{ reason, run_id: info.runId, graph: info.graph },
					info.blogId
				),
		} );

		return unsubscribe;
	}, [ info ] );

	return view;
}
