type Experiment = { [ key: string ]: string };
type Experiments = { [ key: string ]: Experiment };

const experiments: Experiments = {};
const PLANS_LIST_NAMESPACE = 'plans-list';

const setExperiment = ( namespace: string, experimentName: string, variation: string ): void => {
	if ( ! experiments[ namespace ] ) {
		experiments[ namespace ] = {};
	}
	experiments[ namespace ][ experimentName ] = variation;
};

const getExperiment = ( namespace: string, experimentName: string ): string | undefined => {
	return experiments[ namespace ]?.[ experimentName ];
};

export const setPlansListExperiment = ( experimentName: string, variation: string ): void => {
	setExperiment( PLANS_LIST_NAMESPACE, experimentName, variation );
};

export const getPlansListExperiment = ( experimentName: string ): string | undefined => {
	return getExperiment( PLANS_LIST_NAMESPACE, experimentName );
};

export const setTrailMapExperiment = ( variation: string ): void => {
	setExperiment( PLANS_LIST_NAMESPACE, 'wpcom_trail_map_feature_structure_experiment', variation );
};
type TrailMapVariantType =
	| 'control'
	| 'treatment-copy-and-structure'
	| 'treatment-copy'
	| 'treatment-structure';
export const getTrailMapExperiment = () => {
	return ( getExperiment( PLANS_LIST_NAMESPACE, 'wpcom_trail_map_feature_structure_experiment' ) ??
		'control' ) as TrailMapVariantType;
};

export const isTrailMapVariant = (): boolean =>
	getTrailMapExperiment() === 'treatment-copy-and-structure' ||
	getTrailMapExperiment() === 'treatment-copy';
