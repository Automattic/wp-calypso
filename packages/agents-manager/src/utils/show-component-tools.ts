export const BIG_SKY_SHOW_COMPONENT_TOOL_ID = 'big_sky__show_component';
export const JETPACK_AI_SHOW_COMPONENT_TOOL_ID = 'jetpack_ai__show_component';

const SHOW_COMPONENT_TOOL_IDS = [
	BIG_SKY_SHOW_COMPONENT_TOOL_ID,
	JETPACK_AI_SHOW_COMPONENT_TOOL_ID,
];

export function isShowComponentTool( toolId: unknown ): boolean {
	return typeof toolId === 'string' && SHOW_COMPONENT_TOOL_IDS.includes( toolId );
}

/**
 * Component types that no longer render in AM chats — history messages show
 * their stored summary or a short notice instead, with no zoom action.
 * TODO: Remove once Big Sky drops its pattern-picker chat component; the
 * provider fallthrough then resolves nothing and the notice happens on its own.
 */
export function isDeprecatedShowComponentType( type: unknown ): boolean {
	return type === 'pattern-picker';
}
