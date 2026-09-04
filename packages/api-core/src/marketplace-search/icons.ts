const GENERATED_ICON_URL_PREFIX = 'https://s.w.org/plugins/geopattern-icon/';

/**
 * Builds the pattern URL wp.org generates for a plugin with no icon of its own.
 * @param pluginSlug the plugin slug
 * @returns the generated pattern URL
 */
export const buildDefaultIconUrl = ( pluginSlug: string ): string =>
	`${ GENERATED_ICON_URL_PREFIX }${ pluginSlug }.svg`;

/**
 * Whether an icon URL is a generated pattern rather than a real asset.
 *
 * A pattern is not always wrong — it is also what wp.org serves for a plugin
 * that has no icon. See SEARCH-333.
 * @param icon a plugin icon URL
 * @returns true when the URL is a generated pattern
 */
export const isGeneratedPluginIcon = ( icon?: string ): boolean =>
	!! icon?.startsWith( GENERATED_ICON_URL_PREFIX );
