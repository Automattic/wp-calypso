export const GSUITE_INITIAL_STEP = 'gsuite_initial_step';
export const GSUITE_SURVEY_STEP = 'gsuite_survey_step';

// the possibility for more complicated steps exists, but for now they are extremely simple
export const nextStep = () => {
	return GSUITE_SURVEY_STEP;
};

export const previousStep = () => {
	return GSUITE_INITIAL_STEP;
};
