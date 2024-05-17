import { useCallback } from '@wordpress/element';
import classNames from 'classnames';
import FlowCard from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/components/flow-card';
import { Option } from '../types';
import { QuestionSelectionComponentProps } from './question-step';

const SurveyFlowCard = ( {
	onChange,
	question,
	value,
	disabled,
	onContinue,
}: QuestionSelectionComponentProps ) => {
	const questionKey = question?.key;

	const handleClick = useCallback(
		( questionKey: string, newValue: string[] ) => {
			if ( ! value.includes( newValue[ 0 ] ) ) {
				onChange( questionKey, newValue );
			}
		},
		[ onChange, value ]
	);

	return (
		<div
			className={ classNames( 'question-flow-cards', {
				'is-disabled': disabled,
			} ) }
		>
			{ question?.options?.map( ( question: Option ) => {
				return (
					<FlowCard
						key={ question.value }
						title={ question.label }
						text={ question.helpText ?? '' }
						onClick={ () => {
							if ( ! disabled ) {
								handleClick( questionKey, [ question.value ] );
								onContinue?.();
							}
						} }
						icon={ undefined }
					/>
				);
			} ) }
		</div>
	);
};

export default SurveyFlowCard;
