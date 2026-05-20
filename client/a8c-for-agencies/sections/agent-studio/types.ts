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

export interface CreateAgentStudioOutputInput {
	agentId: string;
	agentName: string;
	deliverableType: string;
	title: string;
	description: string;
}

export type OnePagerContentField = 'title' | 'blurb';

export interface AgentStudioService {
	listProjects(): Promise< AgentStudioProjectSummary[] >;
	getProject( projectId: string ): Promise< AgentStudioProject | undefined >;
	createProject( input: CreateAgentStudioProjectInput ): Promise< AgentStudioProject >;
	deleteProject( projectId: string ): Promise< void >;
	listProjectOutputs( projectId: string ): Promise< AgentStudioOutput[] >;
	listOutputs(): Promise< AgentStudioOutput[] >;
	createOutput( input: CreateAgentStudioOutputInput ): Promise< AgentStudioOutput >;
	deleteOutput( outputId: string ): Promise< void >;
	suggestOnePagerContent( brief: string, field: OnePagerContentField ): Promise< string >;
}
