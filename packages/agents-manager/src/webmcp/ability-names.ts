export const GET_BLOCK_TREE_ABILITY_NAME = 'agents-manager/get-block-tree';
export const APPLY_BLOCK_EDITS_ABILITY_NAME = 'big-sky/apply-block-edits';
export const SHOW_TEMPLATE_ABILITY_NAME = 'big-sky/show-template';
export const WEBMCP_SERVER_ABILITY_NAMES = [
	'wpcom/get-block-schemas',
	'wpcom/get-content-guidelines',
	'wpcom/get-posts',
	'wpcom/get-site-stats',
	'wpcom/media-create',
	'wpcom/patterns-list',
	'wpcom/patterns-get',
	'core/get-site-info',
] as const;

export const MEDIA_CREATE_ABILITY_NAME = 'wpcom/media-create';
export const WEBMCP_MUTATING_SERVER_ABILITY_NAMES = [ MEDIA_CREATE_ABILITY_NAME ] as const;

export type WebMcpServerAbilityName = ( typeof WEBMCP_SERVER_ABILITY_NAMES )[ number ];

export function isWebMcpServerAbilityName( name: string ): name is WebMcpServerAbilityName {
	return ( WEBMCP_SERVER_ABILITY_NAMES as readonly string[] ).includes( name );
}

export function isWebMcpMutatingServerAbilityName( name: string ): boolean {
	return ( WEBMCP_MUTATING_SERVER_ABILITY_NAMES as readonly string[] ).includes( name );
}
