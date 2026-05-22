export type AgentId = 'blog-asset-set' | 'one-pager' | 'pitch-deck';

export type DeliverableKind = 'asset-kit' | 'deck' | 'doc';

export type Agent = {
	id: AgentId;
	name: string;
	title: string;
	description: string;
	deliverableKind: DeliverableKind;
	greeting?: string;
	disabled?: boolean;
};

export type BrandTokens = {
	brandPrimary: string;
	brandSecondary: string;
	textPrimary: string;
	textSecondary: string;
	textOnBrand: string;
	surfacePrimary: string;
	surfaceSecondary: string;
	surfaceBrand: string;
};

export type FontRole = 'display' | 'h1' | 'h2' | 'h3' | 'eyebrow' | 'body' | 'mono';

export type FontCase = 'as-typed' | 'uppercase' | 'lowercase' | 'title-case' | 'sentence-case';

export type BrandTypography = {
	headlineWeight: number;
	headlineCase: 'uppercase' | 'asis' | 'titlecase';
	headlineTracking: string;
	headlineLineHeight: number;
};

export type Project = {
	id: string;
	name: string;
	// Slug of the BrandPack this project uses. Always set — projects can only
	// pick between hardcoded packs. Defaults to 'automattic'
	// for newly-created projects.
	brandPackSlug: string;
	createdAt: number;
	updatedAt: number;
};

export type OutputSize = {
	label: string;
	width: number;
	height: number;
};

export type OutputRender = {
	size: OutputSize;
	// Legacy and non-Ela renders are stored as PNG data URLs. Ela one-pagers
	// now store HTML here and rasterize only for explicit export actions.
	dataUrl?: string;
	html?: string;
	// Tag set when this render is one of several cover variant options.
	// The viewer surfaces a picker so the user can choose which variant
	// to display; renders without this tag are body / closer pages.
	coverVariant?: string;
	// Optional group heading shown above the render in the viewer. Used by
	// Bea to label which layout family each render belongs to when a single
	// Output bundles multiple families.
	groupLabel?: string;
};

export type OutputCost = {
	model: string;
	inputTokens: number;
	outputTokens: number;
	usd: number;
	durationMs?: number;
	reasoning?: string;
};

export type TokenName = keyof BrandTokens;

export type KitCardType = 'title' | 'photo' | 'quote' | 'stat' | 'closer';

export type KitRender = {
	cardType: KitCardType;
	size: OutputSize;
	dataUrl: string;
};

export type RatingCriterion = 'fit' | 'layout' | 'brand' | 'image' | 'design';

// Snapshot of the form inputs that produced an Output. Stored so the user
// can return to the brief later and remix without re-uploading logos or
// re-pasting text. Shape mirrors the Ela form fields one-for-one.
export type ElaOutputInput = {
	text: string;
	title: string;
	blurb: string;
	images: { fileName: string; dataUrl: string }[];
	partnerLogo: { fileName: string; dataUrl: string } | null;
	partnerLogoDark: { fileName: string; dataUrl: string } | null;
	partnerLogoOrder: 'brand-first' | 'partner-first';
};

export type OutputRating = {
	fit: number;
	layout: number;
	brand: number;
	image: number;
	design: number;
	notes?: string;
	ratedAt: number;
};

export type Output = {
	id: string;
	projectId: string;
	agentId: AgentId;
	title: string;
	tagPill?: string;
	variantLabel?: string;
	heroDataUrl?: string;
	heroFileName?: string;
	quote?: string;
	quoteAttribution?: string;
	stat?: string;
	statContext?: string;
	closerVerb?: string;
	domain?: string;
	htmlDoc?: string;
	designerNotes?: string;
	renders: OutputRender[];
	// Index into the cover-variant renders chosen by the user in the viewer.
	// Defaults to 0 (the LLM's first cover) when absent.
	selectedCoverIdx?: number;
	kitRenders?: KitRender[];
	// Low-res PNG snapshots of the first few renders, generated once after the
	// Output finishes so the project screen shows images instead of live-
	// rendering HTML on every load. Populated asynchronously; may be absent.
	previewThumbs?: OutputRender[];
	cost?: OutputCost;
	rating?: OutputRating;
	version?: string;
	status: 'in_progress' | 'done' | 'failed';
	createdAt: number;
	// Form inputs that produced this Output. Present on one-pager outputs;
	// used by the Remix action to re-open the brief pre-filled.
	input?: ElaOutputInput;
};
