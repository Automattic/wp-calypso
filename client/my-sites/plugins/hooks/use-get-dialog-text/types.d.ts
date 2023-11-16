import type { Plugin, Site } from '../types';
import type { translate as TranslateFn, TranslateResult } from 'i18n-calypso';

export type TranslatableText = ( translate: TranslateFn ) => TranslateResult;

export type ActionHeadings = {
	onePlugin: ( plugin: Plugin ) => TranslatableText;
	manyPlugins: ( plugins: Plugin[] ) => TranslatableText;
};

export type ActionMessages = {
	onePluginOneSite: ( plugin: Plugin, site: Site ) => TranslatableText;
	onePluginManySites: ( plugin: Plugin, sites: Site[] ) => TranslatableText;
	manyPluginsOneSite: ( plugins: Plugin[], site: Site ) => TranslatableText;
	manyPluginsManySites: ( plugins: Plugin[], sites: Site[] ) => TranslatableText;
};

export type ActionTexts = {
	headings: ActionHeadings;
	messages: ActionMessages;
};

export type DialogText = {
	heading: TranslateResult;
	message: TranslateResult;
};

export type DialogTextGetter = (
	translate: ReturnType< typeof TranslateFn >,
	plugins: Plugin[],
	sites: Site[]
) => TranslateResult;
