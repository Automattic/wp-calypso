// NOTE: This is a crude version of an enum,
// since TypeScript enums behave strangely
// with regular JavaScript after transpilation
export const PluginActions = {
	ACTIVATE: 'activate',
	DEACTIVATE: 'deactivate',
	REMOVE: 'remove',
	UPDATE: 'update',
	ENABLE_AUTOUPDATES: 'enableAutoUpdates',
	DISABLE_AUTOUPDATES: 'disableAutoUpdates',
} as const;

export type PluginActionName = ( typeof PluginActions )[ keyof typeof PluginActions ];

export type Site = {
	ID: number;
	title: string;
	canUpdateFiles?: boolean;
};

export type Plugin = {
	slug: string;
	sites: Record< string, unknown >;
	name?: string;
};
