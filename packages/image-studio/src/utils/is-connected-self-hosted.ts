import { getAgentsManagerInlineData } from '@automattic/agents-manager';

export function isConnectedSelfHosted(): boolean {
	return getAgentsManagerInlineData()?.isWpcomPlatform === false;
}
