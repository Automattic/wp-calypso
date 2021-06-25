export const createSiteFeaturesObject = ( features = {} ) => {
	features.active = features.active || [];
	features.available = features.available || {};
	return features;
};
