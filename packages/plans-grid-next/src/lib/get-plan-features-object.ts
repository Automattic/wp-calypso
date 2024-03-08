import { FeatureList } from '@automattic/calypso-products';

// TODO: Temporary until feature definitions are ported to calypso-products package
const getPlanFeaturesObject = ( featuresList: FeatureList, planFeatures?: Array< string > ) => {
	if ( ! planFeatures ) {
		return [];
	}

	return planFeatures.map( ( featuresConst ) => featuresList[ featuresConst ] );
};

export default getPlanFeaturesObject;
