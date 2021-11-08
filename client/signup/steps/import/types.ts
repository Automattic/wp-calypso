export type GoToStep = ( stepName: string, stepSectionName?: string, flowName?: string ) => void;
export type GoToNextStep = () => void;
export type UrlData = {
	url: string;
	platform: string;
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
