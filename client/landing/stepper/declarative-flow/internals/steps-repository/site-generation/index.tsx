import config from '@automattic/calypso-config';
import { useReducedMotion } from '@wordpress/compose';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import {
	BUILD_WOW_STREAMING_FLAG,
	DESIGN_CANDIDATES_FLAG,
	getBuildWowGraph,
	getDesignCandidate,
} from 'calypso/landing/stepper/utils/build-wow';
import { useBuildWowStream } from './stream/use-build-wow-stream';
import { useSiteGeneration } from './use-site-generation';
import { SiteGenerationView } from './view';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteGeneration: StepType = function SiteGeneration() {
	const translate = useTranslate();
	const query = useMemo( () => new URLSearchParams( window.location.search ), [] );
	const siteIdentifier = query.get( 'siteId' ) || query.get( 'siteSlug' );
	const siteSlug = query.get( 'siteSlug' );
	const source = query.get( 'source' );
	const specId = query.get( 'specId' );
	const graph = getBuildWowGraph( query );
	// A retry sends the pick again only while the flag is on, as the first request did.
	const designCandidate = config.isEnabled( DESIGN_CANDIDATES_FLAG )
		? getDesignCandidate( query.get( 'designCandidate' ) )
		: undefined;
	// Fallback checklist only: the server-computed ui.steps from the status
	// endpoint is authoritative (labels included, already localized). This
	// list covers the moments before the first response arrives, and backends
	// that do not send the ui block yet. Keep these IDs aligned with the server
	// so React preserves each progress row when the first response arrives.
	const steps = useMemo(
		() => [
			{ id: 'prepare', label: translate( 'Preparing your site' ) },
			{ id: 'design', label: translate( 'Creating your design' ) },
			{ id: 'pages', label: translate( 'Building your pages' ) },
			{ id: 'images', label: translate( 'Adding your images' ) },
			{ id: 'polish', label: translate( 'Polishing your site' ) },
			{ id: 'publish', label: translate( 'Doing final checks' ) },
		],
		[ translate ]
	);
	const [ previewReady, setPreviewReady ] = useState( false );
	const shouldReduceMotion = useReducedMotion();
	const state = useSiteGeneration( {
		siteIdentifier,
		source,
		specId,
		graph,
		designCandidate,
		steps,
		completionDelayMs: previewReady && ! shouldReduceMotion ? 2600 : 0,
	} );
	const streamingEnabled = config.isEnabled( BUILD_WOW_STREAMING_FLAG );
	const stream = useBuildWowStream( streamingEnabled ? ( state.streamInfo ?? null ) : null );
	// The build only asks for a feed; the server may decline it. Show the live
	// canvas once the status response advertises a stream, even before the
	// event subscription delivers its first state.
	const streamRequested = streamingEnabled && Boolean( state.streamInfo );

	const reload = () => {
		window.location.reload();
	};

	return (
		<>
			<DocumentHead title={ translate( 'Generating your site' ) } />
			<SiteGenerationView
				graph={ graph }
				onReload={ reload }
				onPreviewReady={ setPreviewReady }
				siteSlug={ siteSlug }
				state={ state }
				stream={ streamingEnabled ? stream : null }
				streamRequested={ streamRequested }
			/>
		</>
	);
};

export default SiteGeneration;
