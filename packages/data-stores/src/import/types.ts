export interface ImportableSiteSuccessResponse {
	site_url: string;
	site_status: number;
	site_title: string;
	site_favicon: string;
	site_engine: string;
	importer_types: Array< string >;
	site_meta: {
		jetpack_version: string;
	};
}

export interface ImportableSiteErrorResponse {
	code: string;
	message: string;
	data: {
		status: number;
	};
	status: number;
}

export type ImportableSiteResponse = ImportableSiteSuccessResponse | ImportableSiteErrorResponse;

export type ImportableSiteData = ImportableSiteSuccessResponse;
