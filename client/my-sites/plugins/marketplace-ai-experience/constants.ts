// Plugin Compass "Describe" surface is registered as a regular marketplace
// category slug, then PluginsBrowser renders MarketplaceAIExperience as the
// body when that slug is active. Keep this constant in lockstep with the
// `describe` entry in `categories/use-categories.tsx`.

export const DESCRIBE_CATEGORY_SLUG = 'describe';
export const DESCRIBE_ROUTE_PREFIX = `/plugins/browse/${ DESCRIBE_CATEGORY_SLUG }`;
