export type AgentStudioOutputStatus = 'ready' | 'generating' | 'failed';

export interface AgentStudioProject {
	id: string;
	name: string;
	clientName?: string;
	brief?: string;
	isDefault?: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface AgentStudioOutput {
	id: string;
	projectId: string;
	title: string;
	description: string;
	agentName: string;
	deliverableType: string;
	status: AgentStudioOutputStatus;
	/** Preview images of the generated assets, populated once status is ready. */
	previewUrls?: string[];
	/** Total number of assets the agent produced, populated once status is ready. */
	assetCount?: number;
	/** Tags the output to a specific agent renderer in the output-detail UI. */
	kind?: 'one-pager';
	/** Surfaced on the deliverable card when generation fails. */
	errorMessage?: string;
	createdAt: string;
	updatedAt: string;
}

export interface AgentStudioProjectSummary extends AgentStudioProject {
	outputCount: number;
	latestOutput?: AgentStudioOutput;
}

export interface CreateAgentStudioProjectInput {
	name: string;
	clientName?: string;
	brief?: string;
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
	/** Resolved project id (passed as string for transport compatibility with the mock). */
	projectId?: string;
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
}

export interface AgentStudioService {
	listProjects(): Promise< AgentStudioProjectSummary[] >;
	getProject( projectId: string ): Promise< AgentStudioProject | undefined >;
	createProject( input: CreateAgentStudioProjectInput ): Promise< AgentStudioProject >;
	deleteProject( projectId: string ): Promise< void >;
	listProjectOutputs( projectId: string ): Promise< AgentStudioOutput[] >;
	listOutputs( agencyId?: number ): Promise< AgentStudioOutput[] >;
	createOutput(
		input: CreateAgentStudioOutputInput,
		agencyId?: number
	): Promise< AgentStudioOutput >;
	deleteOutput( outputId: string, agencyId?: number ): Promise< void >;
}
