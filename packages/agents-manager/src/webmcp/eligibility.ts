import { getWebMcpModelContext } from '@automattic/webmcp';
import { getAgentsManagerInlineData } from '../utils/get-agents-manager-inline-data';
import { isEditorPage } from '../utils/is-editor-page';

export { getWebMcpModelContext };

export function isWebMcpExperimentEnabled(): boolean {
	return getAgentsManagerInlineData()?.isDevMode === true;
}

export function canExposeWebMcpTools(): boolean {
	return isWebMcpExperimentEnabled() && isEditorPage() && !! getWebMcpModelContext();
}
