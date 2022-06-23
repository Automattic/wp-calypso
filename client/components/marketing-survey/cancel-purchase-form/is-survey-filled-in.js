import { isDomainRegistration } from '@automattic/calypso-products';
import { getCancellationReasons } from 'calypso/components/marketing-survey/cancel-purchase-form/cancellation-reasons';

export default function isSurveyFilledIn( survey, isImport = false, purchase = {} ) {
	const answeredBothQuestions = survey.questionOneRadio && survey.questionTwoRadio;
	const { productSlug } = purchase;
	const reasons = getCancellationReasons( survey.questionOneOrder, { productSlug } );
	const questionOneReason = reasons.find( ( { value } ) => value === survey.questionOneRadio );

	if ( questionOneReason?.isTextRequired && survey.questionOneText === '' ) {
		return false;
	}

	if ( questionOneReason?.isNextStepBlocked ) {
		return false;
	}

	if ( isDomainRegistration( purchase ) && ! survey.questionOneConfirmed ) {
		return false;
	}

	if ( survey.questionTwoRadio === 'anotherReasonTwo' && survey.questionTwoText === '' ) {
		return false;
	}

	if ( isImport && ! survey.importQuestionRadio ) {
		return false;
	}

	if (
		survey.questionOneRadio &&
		survey.questionTwoOrder &&
		survey.questionTwoOrder.length === 0
	) {
		return true;
	}

	if ( ! answeredBothQuestions ) {
		return false;
	}

	return true;
}
