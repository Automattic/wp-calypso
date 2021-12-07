export type GoToStep = ( stepName: string, stepSectionName?: string, flowName?: string ) => void;
export type GoToNextStep = () => void;
export type RecordTracksEvent = ( name: string, properties: { [ key: string ]: string } ) => void;
export type UrlData = {
	url: string;
	platform: string;
	platform_data?: {
		is_wpcom: boolean;
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
