import { useCallback } from '@wordpress/element';
import FlowCard from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/components/flow-card';
import { Option, Question } from '../types';

type SurveyFlowCardProps = {
	question: Question;
	option: Option;
	onChange: ( key: string, value: string[] ) => void;
	value: string[];
	disabled?: boolean;
	onContinue?: () => void;
};

const SurveyFlowCardControl = ( {
	onChange,
	question,
	value,
	onContinue,
}: SurveyFlowCardProps ) => {
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
		<div className="site-intent">
			{ question?.options?.map( ( question: Option ) => {
				return (
					<FlowCard
						key={ question.value }
						title={ question.label }
						text={ question.helpText ?? '' }
						onClick={ () => {
							handleClick( questionKey, [ question.value ] );
							onContinue();
						} }
						icon={ undefined }
					/>
				);
			} ) }
		</div>
	);
};

export default SurveyFlowCardControl;
