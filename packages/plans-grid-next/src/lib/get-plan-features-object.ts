import { FeatureList } from '@automattic/calypso-products';

type FeatureMethodParams = { domainName?: string; isExperimentVariant?: boolean };

// TODO: Temporary until feature definitions are ported to calypso-products package
const getPlanFeaturesObject = (
	featuresList: FeatureList,
	planFeatures?: Array< string >,
	isExperimentVariant?: boolean
) => {
	if ( ! planFeatures ) {
		return [];
	}

	return planFeatures.map( ( featuresConst ) => {
		const feature = featuresList[ featuresConst ];
		if ( ! feature || ! isExperimentVariant ) {
			return feature;
		}
		// Wrap feature methods to pass isExperimentVariant parameter
		return {
			...feature,
			getTitle: ( params?: FeatureMethodParams ) =>
				feature.getTitle( { ...params, isExperimentVariant } ),
			...( feature.getDescription && {
				getDescription: ( params?: FeatureMethodParams ) =>
					feature.getDescription!( { ...params, isExperimentVariant } ),
			} ),
		};
	} );
};

export default getPlanFeaturesObject;
