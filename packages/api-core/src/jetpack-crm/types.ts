export interface JetpackCrmExtension {
	name: string;
	description: string;
	slug: string;
	version: string;
	kbUrl?: string;
}

export interface JetpackCrmExtensionDownload {
	download_url: string;
}
