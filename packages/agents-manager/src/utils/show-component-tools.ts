export const BIG_SKY_SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';
export const JETPACK_AI_SHOW_COMPONENT_TOOL_ID = 'jetpack_ai__show_component';

const SHOW_COMPONENT_TOOL_IDS = [
	BIG_SKY_SHOW_COMPONENT_TOOL_ID,
	JETPACK_AI_SHOW_COMPONENT_TOOL_ID,
];

export function isShowComponentTool( toolId: unknown ): boolean {
	return typeof toolId === 'string' && SHOW_COMPONENT_TOOL_IDS.includes( toolId );
}
