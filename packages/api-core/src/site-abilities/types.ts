/** Annotations a site-published ability declares in `meta.annotations` (WP Abilities API). */
export type SiteAbilityAnnotations = {
	readonly?: boolean;
	destructive?: boolean;
	idempotent?: boolean;
	openWorldHint?: boolean;
};

/** One ability from a connected site's `/wp-abilities/v1/abilities` catalog. */
export type SiteAbility = {
	name: string;
	label?: string;
	description?: string;
	category?: string;
	meta?: {
		annotations?: SiteAbilityAnnotations;
	};
};
