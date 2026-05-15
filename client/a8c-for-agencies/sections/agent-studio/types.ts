export type AgentStudioOutputStatus = 'ready' | 'generating' | 'failed';

export interface AgentStudioProject {
	id: string;
	name: string;
	clientName?: string;
	brief?: string;
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

export interface AgentStudioService {
	listProjects(): Promise< AgentStudioProjectSummary[] >;
	getProject( projectId: string ): Promise< AgentStudioProject | undefined >;
	createProject( input: CreateAgentStudioProjectInput ): Promise< AgentStudioProject >;
	deleteProject( projectId: string ): Promise< void >;
	listProjectOutputs( projectId: string ): Promise< AgentStudioOutput[] >;
}
