function featureNotPartOfTrial( feature ) {
	return feature.not_part_of_free_trial;
}

function featureListHasAFreeTrialException( featuresList ) {
	return featuresList.some( function( feature ) {
		return featureNotPartOfTrial( feature );
	} );
}

export default {
	featureNotPartOfTrial,
	featureListHasAFreeTrialException
};
