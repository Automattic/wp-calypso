import EcommerceSegmentationSurvey from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/ecommerce-segmentation-survey';

export function renderSurvey( context, next ) {
	context.primary = (
		<EcommerceSegmentationSurvey flow="ecommerce" navigation={ {} } stepName="survey" />
	);

	next();
}
