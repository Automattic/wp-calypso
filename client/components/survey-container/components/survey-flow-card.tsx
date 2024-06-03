import { useCallback } from '@wordpress/element';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
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
	const [ submitted, setSubmitted ] = useState( false );

	const handleClick = useCallback(
		( questionKey: string, newValue: string[] ) => {
			if ( ! value.includes( newValue[ 0 ] ) ) {
				onChange( questionKey, newValue );
			}
		},
		[ onChange, value ]
	);

	// We rely on submitted state, to ensure that the answer dependencies are properly resolved
	useEffect( () => {
		if ( submitted ) {
			onContinue?.();
			setSubmitted( false );
		}
	}, [ submitted, onContinue ] );

	return (
		<div
			className={ clsx( 'question-flow-cards', {
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
							handleClick( questionKey, [ question.value ] );
							setSubmitted( true );
						} }
						icon={ undefined }
						disabled={ disabled }
					/>
				);
			} ) }
		</div>
	);
};

export default SurveyFlowCard;
