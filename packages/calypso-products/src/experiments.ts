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

/* START: Experiment calypso_pricing_grid_fewer_features */

export const SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID = 'calypso_pricing_grid_fewer_features';

export type SimplifiedFeaturesGridExperimentVariant = 'control' | 'simplified' | 'fix_inaccuracies';

export const setSimplifiedFeaturesGridExperimentVariant = (
	variant: SimplifiedFeaturesGridExperimentVariant
) => setExperiment( PLANS_LIST_NAMESPACE, SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID, variant );

export const isAssignedToSimplifiedFeaturesGridExperiment = (): boolean =>
	getExperiment( PLANS_LIST_NAMESPACE, SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID ) !== 'control';

export const isAssignedToSimplifiedFeaturesGridExperimentVariant = (
	variant: SimplifiedFeaturesGridExperimentVariant
): boolean =>
	getExperiment( PLANS_LIST_NAMESPACE, SIMPLIFIED_FEATURES_GRID_EXPERIMENT_ID ) === variant;

/* END: Experiment calypso_pricing_grid_fewer_features */
