export interface RawJetpackPluginKeys {
	success: true;
	keys: {
		vaultpress?: string;
		akismet?: string;
	};
}

export interface JetpackPluginKey {
	slug: string;
	key: string;
}
