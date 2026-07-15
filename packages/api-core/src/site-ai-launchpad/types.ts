export interface AiLaunchpadTask {
	id: string;
	completed: boolean;
	skipped?: boolean;
	disabled?: boolean;
}

export interface AiLaunchpad {
	tasks: AiLaunchpadTask[];
	dismissed: boolean;
	is_eligible: boolean;
}

export type AiLaunchpadStatus = 'active' | 'completed';

export interface AiLaunchpadSiteOptions {
	wpcom_ai_launchpad_enabled?: boolean;
	wpcom_ai_launchpad_dismissed?: boolean;
	wpcom_ai_launchpad_completed?: boolean;
	site_intent?: string;
	site_creation_flow?: string;
}
