import type { McpAvailableAbility } from '@automattic/api-core';

export type McpToolType = 'read' | 'write';

export function isWriteAbility( ability: McpAvailableAbility ) {
	return ability.readonly === false;
}

export function getAbilitiesForToolType(
	abilities: McpAvailableAbility[],
	toolType: McpToolType
): McpAvailableAbility[] {
	return abilities.filter( ( ability ) =>
		toolType === 'write' ? isWriteAbility( ability ) : ! isWriteAbility( ability )
	);
}
