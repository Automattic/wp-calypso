export type ImportLabIssueCategory = 'journey' | 'capture' | 'content' | 'blocks' | 'evidence';
export type ImportLabStrategy = 'ssi' | 'blueprint';

export type ImportLabRepository = {
	label: string;
	repository: string;
	url?: string;
};

const REPOSITORIES: Record< ImportLabIssueCategory, ImportLabRepository > = {
	journey: {
		label: 'Import journey and Calypso UI',
		repository: 'Automattic/wp-calypso',
		url: 'https://github.com/Automattic/wp-calypso',
	},
	capture: {
		label: 'Capture and import orchestration',
		repository: 'WPCOM monorepo',
	},
	content: {
		label: 'Static source extraction and import planning',
		repository: 'Automattic/static-site-importer',
		url: 'https://github.com/Automattic/static-site-importer',
	},
	blocks: {
		label: 'Generated block markup and rendering',
		repository: 'Automattic/blocks-engine',
		url: 'https://github.com/Automattic/blocks-engine',
	},
	evidence: {
		label: 'Import evidence and test harness',
		repository: 'Automattic/wp-calypso',
		url: 'https://github.com/Automattic/wp-calypso',
	},
};

export function getImportLabRepository( category: ImportLabIssueCategory ) {
	return REPOSITORIES[ category ];
}

export function normalizeImportLabUrl( value: string ) {
	const url = new URL( value.trim() );
	if ( ! [ 'http:', 'https:' ].includes( url.protocol ) ) {
		throw new Error( 'Only HTTP and HTTPS URLs are supported.' );
	}
	url.hash = '';
	return url.href;
}

export function getMshotsUrl( url: string ) {
	return `https://s0.wp.com/mshots/v1/${ encodeURIComponent(
		url
	) }?vpw=1440&vph=960&w=720&h=480&screen_height=960`;
}

type PromptInput = {
	strategy: ImportLabStrategy;
	category: ImportLabIssueCategory;
	observation: string;
	sourceUrl: string;
	targetUrl: string;
	sessionId?: string;
	state?: string;
	previewSummary?: Record< string, number >;
	receipt?: Record< string, boolean | number | string | undefined >;
};

function formatMetrics( metrics?: Record< string, unknown > ) {
	if ( ! metrics || Object.keys( metrics ).length === 0 ) {
		return 'Not available';
	}

	return Object.entries( metrics )
		.filter( ( [ , value ] ) => typeof value !== 'undefined' )
		.map( ( [ key, value ] ) => `${ key }: ${ String( value ) }` )
		.join( ', ' );
}

export function buildImportLabAgentPrompt( input: PromptInput ) {
	const owner = getImportLabRepository( input.category );
	const strategy =
		input.strategy === 'ssi'
			? 'Faithful reconstruction (SSI)'
			: 'Adapt to an existing WordPress theme (Blueprint)';
	const verification =
		input.strategy === 'ssi'
			? 'Re-run SSI and compare visual parity, imported content, preview metrics, and the terminal receipt.'
			: 'Re-run blueprint extraction and mapping, then verify that source content and structure map into the destination theme templates, patterns, and styles.';
	return `Investigate and fix this Import Lab finding in ${ owner.repository }.

Import evidence
- Strategy: ${ strategy }
- Session: ${ input.sessionId ?? 'not assigned' }
- Source: ${ input.sourceUrl }
- Destination: ${ input.targetUrl }
- State: ${ input.state ?? 'not available' }
- Preview metrics: ${ formatMetrics( input.previewSummary ) }
- Import receipt: ${ formatMetrics( input.receipt ) }

Observed problem
${ input.observation.trim() || 'Describe the visible or measurable defect before starting.' }

Success criteria
1. Reproduce the defect from the source and destination URLs without using production credentials or private customer data.
2. Identify the owning-layer root cause and implement the smallest durable fix in ${
		owner.repository
	}.
3. Add deterministic coverage for the user-visible behavior or data contract that failed.
4. ${ verification }
5. Open a pull request with reproduction steps, evidence, verification, and an AI-assistance disclosure naming the model and coding tool used.

Preserve unrelated work and keep private Automattic URLs, credentials, and customer content out of public repositories.`;
}
