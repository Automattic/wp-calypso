export const BIG_SKY_SHOW_COMPONENT_ABILITY = 'big-sky/show-component';
export const BIG_SKY_SHOW_COMPONENT_AGENTTIC_TOOL_ID = 'big-sky-show-component';
export const BIG_SKY_SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';
export const JETPACK_AI_SHOW_COMPONENT_TOOL_ID = 'jetpack_ai__show_component';

const SHOW_COMPONENT_TOOL_IDS = [
	BIG_SKY_SHOW_COMPONENT_ABILITY,
	BIG_SKY_SHOW_COMPONENT_AGENTTIC_TOOL_ID,
	BIG_SKY_SHOW_COMPONENT_TOOL_ID,
	JETPACK_AI_SHOW_COMPONENT_TOOL_ID,
];

export function isShowComponentTool( toolId: unknown ): boolean {
	return typeof toolId === 'string' && SHOW_COMPONENT_TOOL_IDS.includes( toolId );
}
