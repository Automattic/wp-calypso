import type { ReactNode } from 'react';

export type AgentsApiFetch = ( input: {
	path: string;
	method?: string;
	data?: Record< string, unknown >;
	headers?: Record< string, string >;
} ) => Promise< unknown >;

export interface AgentsApiAttachment {
	filename?: string;
	mime_type?: string;
	url?: string;
	media_id?: number | string;
}

export type AgentsApiMediaUpload = (
	file: File
) => Promise< AgentsApiAttachment >;

export interface AgentsApiMessage {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'component' | 'context' | 'data';
		text?: string;
		component?: React.ComponentType;
		componentProps?: Record< string, unknown >;
		data?: Record< string, unknown >;
	} >;
	timestamp: number;
	archived: boolean;
	showIcon: boolean;
	icon?: string;
	disabled?: boolean;
	reactKey?: string;
	attachments?: AgentsApiAttachment[];
	metadata?: Record< string, unknown >;
	raw?: Record< string, unknown >;
}

export interface AgentsApiSession {
	id: string;
	title?: string;
	updated_at?: string;
	updatedAt?: string;
	created_at?: string;
	createdAt?: string;
	unread_count?: number;
	metadata?: Record< string, unknown >;
}

export interface AgentsApiToolGroup {
	id: string;
	name: string;
	call?: {
		id: string;
		message: AgentsApiMessage;
		args?: Record< string, unknown >;
	};
	result?: {
		id: string;
		message: AgentsApiMessage;
		result?: Record< string, unknown >;
	};
}

export type AgentsApiToolRenderers = Record<
	string,
	( group: AgentsApiToolGroup ) => ReactNode
>;

export interface AgentsApiRunEvent {
	id: string;
	run_id: string;
	session_id?: string;
	type: string;
	status?: string;
	metadata?: Record< string, unknown >;
	raw: Record< string, unknown >;
}

export interface AgentsApiQueueMessageResult {
	queued_message_id?: string;
	queuedMessageId?: string;
	session_id?: string;
	sessionId?: string;
	run_id?: string;
	runId?: string;
	position?: number;
	status?: string;
	startedAt?: string;
	updatedAt?: string;
	metadata?: Record< string, unknown >;
}

export interface AgentsApiRunCapabilities {
	chat_run_status?: boolean;
	chat_run_cancel?: boolean;
	chat_message_queue?: boolean;
	chat_run_events?: boolean;
	operator_diagnostics?: boolean;
	status?: boolean;
	cancel?: boolean;
	queue?: boolean;
	events?: boolean;
}

export interface AgentsApiRunAdapter {
	capabilities?: AgentsApiRunCapabilities;
	getRunId?: (
		metadata: Record< string, unknown >
	) => string | null | undefined;
	cancel?: ( input: {
		runId: string;
		sessionId: string;
	} ) => Promise< unknown >;
	queue?: ( input: {
		content: string;
		files?: File[];
		attachments?: AgentsApiAttachment[];
		runId?: string;
		sessionId?: string;
	} ) => Promise< AgentsApiQueueMessageResult >;
	listEvents?: ( input: {
		runId: string;
		sessionId: string;
	} ) => Promise< AgentsApiRunEvent[] >;
}

export interface AgentsApiChatAdapter {
	sendMessage: ( input: {
		message: string;
		sessionId?: string | null;
		attachments?: AgentsApiAttachment[];
	} ) => Promise< unknown >;
	listSessions: () => Promise< unknown >;
	loadSession: ( sessionId: string ) => Promise< unknown >;
	markSessionRead: ( sessionId: string ) => Promise< unknown >;
	deleteSession: ( sessionId: string ) => Promise< unknown >;
}

export interface AgentsApiChatState {
	messages: AgentsApiMessage[];
	sessions: AgentsApiSession[];
	sessionId: string | null;
	isProcessing: boolean;
	error: Error | null;
	sendMessage: ( message: string, files?: File[] ) => Promise< void >;
	loadSession: ( sessionId: string ) => Promise< void >;
	newSession: () => void;
	cancelRun: () => Promise< void >;
}

export interface AgentsApiChatOptions {
	adapter: AgentsApiChatAdapter;
	toolRenderers?: AgentsApiToolRenderers;
	mediaUploadFn?: AgentsApiMediaUpload;
	runAdapter?: AgentsApiRunAdapter;
	getRunId?: (
		metadata: Record< string, unknown >
	) => string | null | undefined;
	onMessage?: ( message: AgentsApiMessage ) => void;
	onError?: ( error: Error ) => void;
	onResponseMetadata?: ( metadata: Record< string, unknown > ) => void;
	onUnreadChange?: ( count: number ) => void;
	isVisible?: boolean;
}
