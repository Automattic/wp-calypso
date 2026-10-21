export type AgentStudioOutputStatus = 'ready' | 'generating' | 'failed';

export interface AgentStudioOutput {
	id: string;
	title: string;
	description: string;
	agentName: string;
	deliverableType: string;
	status: AgentStudioOutputStatus;
	/** Preview images of the generated assets, populated once status is ready. */
	previewUrls?: string[];
	/** Total number of assets the agent produced, populated once status is ready. */
	assetCount?: number;
	/** Surfaced on the deliverable card when generation fails. */
	errorMessage?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AgentStudioSocialAsset {
	id: string;
	label: string;
	sizeKey: 'cover' | 'square' | 'email' | 'story';
	width: number;
	height: number;
	html: string;
	groupLabel?: string;
	/**
	 * Slug-safe id for the layout-direction the tile belongs to (shared
	 * across the cover/square/story/email rendering of one direction).
	 * The PNG download endpoint uses this as its cache key together with
	 * `sizeKey`.
	 */
	directionId: string;
}

export type DualLogoOrder = 'leading' | 'trailing';

export interface CreateAgentStudioOutputInput {
	agentId: string;
	agentName: string;
	deliverableType: string;
	title: string;
	description: string;
	/** Optional override for the recipe slug. Defaults to `compose-one-pager-ela-v2`. */
	recipe?: string;
	/** Free-form source text the layout director composes from. */
	brief?: string;
	/** Short subheading rendered on the cover. */
	blurb?: string;
	/** Optional one-pager: body image URLs returned by `POST /a4a/media`. */
	imageUrls?: string[];
	/** Optional one-pager: primary logo URL. */
	logoUrl?: string;
	/** Optional one-pager: partner / co-marketing logo URL. */
	partnerLogoUrl?: string;
	/** Which logo sits on the leading edge of the dual-logo separator. */
	partnerLogoOrder?: DualLogoOrder;
	/** Optional one-pager: hero image URL for the cover frame. */
	heroUrl?: string;
	/** Optional social assets: original source or campaign notes. */
	sourceText?: string;
	/** Optional social assets: manually supplied headline. */
	headline?: string;
	/** Optional social assets: supporting stat. */
	stat?: string;
	/** Optional social assets: stat context or supporting line. */
	statContext?: string;
	/** Optional social assets: hero / body image URLs returned by `POST /a4a/media`. */
	socialImageUrls?: string[];
	/** Optional social assets: brand logo URL. */
	socialLogoUrl?: string;
	/** Optional social assets: light logo URL for dark backgrounds. */
	socialLogoLightUrl?: string;
}

export interface AgentStudioService {
	listOutputs( agencyId?: number ): Promise< AgentStudioOutput[] >;
	createOutput(
		input: CreateAgentStudioOutputInput,
		agencyId?: number
	): Promise< AgentStudioOutput >;
	deleteOutput( outputId: string, agencyId?: number ): Promise< void >;
}
