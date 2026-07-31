import { fetchSiteEndpoint, reportSafely, startPolling } from './poller';

const BUILD_TERMINAL_STATUSES = new Set( [ 'done', 'fail' ] );

export type BuildProgressResponse = {
	current?: string | null;
	history?: Array< {
		status?: string;
	} >;
};

// Coarse UI milestones for the persisted pipeline step ids. This map chases
// backend pipeline internals across a repo boundary, so it will lag when steps
// are inserted or renamed upstream — an unmapped id degrades to the previous
// milestone, never to breakage. The server owns two sibling maps over the same
// step stream (Builder_Progress_Reader::MILESTONE_LABELS and the Big Sky
// editor's toolId labels); the durable fix is the endpoint serving interpreted
// milestones so the client stops tracking pipeline internals.
const MILESTONE_TOOLS: Record< string, string[] > = {
	preparing: [ 'scaffold-theme', 'scaffold-plugin', 'refine-prompt', 'site-spec' ],
	designing: [
		'apply-identity',
		'design-direction',
		'theme-json',
		'page-plan',
		'theme-json+page-plan',
	],
	building: [
		'queue',
		'execute_batch_1',
		'execute_batch_2',
		'big-sky/generate-header',
		'big-sky/generate-footer',
		'big-sky/generate-section',
		'sections',
		'section-rhythm',
		'collect-images',
		'normalize-layout',
		'header-hero',
		'contrast-fix',
		'motion-sanity',
		'fix-blocks',
	],
	images: [ 'assemble-pages' ],
	polishing: [
		'generate-images',
		'page-styles',
		'custom-motion',
		'bundle-fonts',
		'fonts-php',
		'finalize-theme',
		'validate-theme',
		'cover-contrast',
		'finish',
	],
	publishing: [ 'generate', 'apply' ],
};

const TOOL_MILESTONES: Record< string, string > = Object.fromEntries(
	Object.entries( MILESTONE_TOOLS ).flatMap( ( [ milestone, toolIds ] ) =>
		toolIds.map( ( toolId ) => [ toolId, milestone ] )
	)
);

export function getStepIndexForProgress(
	response: BuildProgressResponse,
	stepIds: string[]
): number | null {
	// The backend refreshes a repeated step's timestamp (heartbeat), so history
	// order does not track milestone order — a long-running tool can resurface
	// after later steps. Take the furthest recognized milestone across the whole
	// history instead of the most recent entry.
	const recordedStatuses = [
		...( response.history ?? [] ).map( ( entry ) => entry.status ),
		response.current,
	];
	let furthestIndex = -1;
	for ( const toolId of recordedStatuses ) {
		const milestone = toolId ? TOOL_MILESTONES[ toolId ] : undefined;
		if ( milestone ) {
			furthestIndex = Math.max( furthestIndex, stepIds.indexOf( milestone ) );
		}
	}
	return furthestIndex === -1 ? null : furthestIndex;
}

type FetchProgress = (
	siteIdentifier: string,
	signal: AbortSignal
) => Promise< BuildProgressResponse >;

const fetchBuildProgress: FetchProgress = async ( siteIdentifier, signal ) =>
	( await fetchSiteEndpoint< BuildProgressResponse >(
		siteIdentifier,
		'build-progress',
		signal
	) ) ?? {};

export function pollForBuildProgress( {
	siteIdentifier,
	onProgress,
	// Milestones advance on the order of tens of seconds, and this poller only
	// supplements the 3s build-status poller — a slower interval loses nothing.
	pollIntervalMs = 10000,
	requestTimeoutMs,
	fetchProgress = fetchBuildProgress,
}: {
	siteIdentifier: string;
	onProgress: ( response: BuildProgressResponse ) => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
	fetchProgress?: FetchProgress;
} ): () => void {
	return startPolling< BuildProgressResponse >( {
		fetch: ( signal ) => fetchProgress( siteIdentifier, signal ),
		pollIntervalMs,
		requestTimeoutMs,
		onResponse: ( response ) => {
			reportSafely( () => onProgress( response ) );
			// Readiness and failure are owned by the build-status poller. These
			// values only stop progress polling after the final history has been
			// reported.
			const status = typeof response.current === 'string' ? response.current : undefined;
			if ( status && BUILD_TERMINAL_STATUSES.has( status ) ) {
				return 'stop';
			}
		},
	} );
}
