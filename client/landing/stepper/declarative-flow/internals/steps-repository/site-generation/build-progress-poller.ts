import wpcom from 'calypso/lib/wp';

const BUILD_TERMINAL_STATUSES = new Set( [ 'done', 'fail' ] );

export type BuildProgressResponse = {
	current?: string | null;
	last_update?: number | null;
	history?: Array< {
		timestamp?: number;
		status?: string;
	} >;
};

const TOOL_MILESTONES: Record< string, string > = {
	'scaffold-theme': 'preparing',
	'scaffold-plugin': 'preparing',
	'refine-prompt': 'preparing',
	'site-spec': 'preparing',
	'apply-identity': 'designing',
	'design-direction': 'designing',
	'theme-json': 'designing',
	'page-plan': 'designing',
	'theme-json+page-plan': 'designing',
	queue: 'building',
	execute_batch_1: 'building',
	execute_batch_2: 'building',
	'big-sky/generate-header': 'building',
	'big-sky/generate-footer': 'building',
	'big-sky/generate-section': 'building',
	sections: 'building',
	'section-rhythm': 'building',
	'collect-images': 'building',
	'normalize-layout': 'building',
	'header-hero': 'building',
	'contrast-fix': 'building',
	'motion-sanity': 'building',
	'fix-blocks': 'building',
	'assemble-pages': 'images',
	'generate-images': 'polishing',
	'page-styles': 'polishing',
	'custom-motion': 'polishing',
	'fonts-php': 'polishing',
	'finalize-theme': 'polishing',
	'validate-theme': 'polishing',
	'cover-contrast': 'polishing',
	finish: 'polishing',
	generate: 'publishing',
	apply: 'publishing',
};

export function getStepIndexForProgress(
	response: BuildProgressResponse,
	stepIds: string[]
): number | null {
	const recordedStatuses = [
		...( response.history ?? [] ).map( ( entry ) => entry.status ),
		response.current,
	];
	const milestone = recordedStatuses.reduceRight< string | undefined >(
		( found, toolId ) => found ?? ( toolId ? TOOL_MILESTONES[ toolId ] : undefined ),
		undefined
	);
	if ( ! milestone ) {
		return null;
	}

	const milestoneIndex = stepIds.indexOf( milestone );
	return milestoneIndex === -1 ? null : milestoneIndex;
}

type FetchProgress = (
	siteIdentifier: string,
	signal: AbortSignal
) => Promise< BuildProgressResponse >;

const fetchBuildProgress: FetchProgress = async ( siteIdentifier, signal ) => {
	const response = ( await wpcom.req.get( {
		path: `/sites/${ siteIdentifier }/big-sky/build-progress`,
		apiNamespace: 'wpcom/v2',
		signal,
	} ) ) as BuildProgressResponse | null;

	return response ?? {};
};

export function pollForBuildProgress( {
	siteIdentifier,
	onProgress,
	pollIntervalMs = 3000,
	requestTimeoutMs = 15000,
	fetchProgress = fetchBuildProgress,
}: {
	siteIdentifier: string;
	onProgress: ( response: BuildProgressResponse ) => void;
	pollIntervalMs?: number;
	requestTimeoutMs?: number;
	fetchProgress?: FetchProgress;
} ): () => void {
	let isActive = true;
	let pollTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestTimeout: ReturnType< typeof setTimeout > | undefined;
	let requestController: AbortController | undefined;

	const poll = async () => {
		const controller = new AbortController();
		const timeout = setTimeout( () => controller.abort(), requestTimeoutMs );
		requestController = controller;
		requestTimeout = timeout;

		let response: BuildProgressResponse | undefined;

		try {
			response = await fetchProgress( siteIdentifier, controller.signal );
		} catch {
			// Progress is supplementary; readiness and failure continue to come
			// from the build-status poller if this request fails.
		} finally {
			clearTimeout( timeout );
			requestController = undefined;
			requestTimeout = undefined;
		}

		if ( ! isActive ) {
			return;
		}

		const status = typeof response?.current === 'string' ? response.current : undefined;

		if ( response ) {
			const progressResponse = response;
			try {
				onProgress( progressResponse );
			} catch {}
		}

		// Readiness and failure are owned by the build-status poller. These values
		// only stop progress polling after the final history has been reported.
		if ( status && BUILD_TERMINAL_STATUSES.has( status ) ) {
			return;
		}

		pollTimeout = setTimeout( () => {
			void poll().catch( () => {} );
		}, pollIntervalMs );
	};

	void poll().catch( () => {} );

	return () => {
		isActive = false;
		if ( pollTimeout !== undefined ) {
			clearTimeout( pollTimeout );
		}
		requestController?.abort();
		if ( requestTimeout !== undefined ) {
			clearTimeout( requestTimeout );
		}
	};
}
