import { type ImporterPlatform } from 'calypso/lib/importer/types';

export type GoToStep = (
	stepName: string,
	stepSectionName?: string,
	params?: { fromUrl: string }
) => void;
export type GoToNextStep = () => void;
export type RecordTracksEvent = ( name: string, properties: { [ key: string ]: string } ) => void;
export type UrlData = {
	url: string;
	platform: ImporterPlatform;
	site_health?: 'ok' | 'unreachable' | 'server_error' | 'blocked' | 'auth_required' | 'not_found';
	// A working site on a known platform other than WordPress.
	static_site_importable?: boolean;
	platform_data?: {
		is_wpcom: boolean;
		is_wpengine: boolean;
		is_pressable: boolean;
		slug?: string;
		name?: string;
		support_url?: string;
		homepage_url?: string;
	};
	meta: {
		favicon: string | null;
		title: string | null;
	};
};
export type MShotParams = {
	vpw?: number;
	scale?: number;
};

export type FeatureName =
	| 'tags'
	| 'posts'
	| 'pages'
	| 'pages_static'
	| 'blocks'
	| 'images'
	| 'photos'
	| 'videos'
	| 'files'
	| 'styles'
	| 'themes'
	| 'themes_custom'
	| 'colors'
	| 'fonts'
	| 'plugins';

export type FeatureList = { [ key in FeatureName ]: string };
