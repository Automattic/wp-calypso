/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

export interface StepInputProps {
	onSelect: () => void;
	inputClass: string;
}

interface QuestionProps {
	label: string;
	displayValue: string;
	StepInput: React.FunctionComponent< StepInputProps >;
	isActive: boolean;
	onExpand: () => void;
	onSelect: () => void;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */

const Question = ( {
	isActive,
	onExpand,
	onSelect,
	displayValue,
	label,
	StepInput,
}: QuestionProps ) => (
	<div
		className={ classNames( {
			'onboarding-block__question': true,
			selected: isActive,
		} ) }
	>
		<span>{ label }</span>
		<div className="">
			{ isActive ? (
				<StepInput onSelect={ onSelect } inputClass="onboarding-block__question-input" />
			) : (
				<>
					<button className="onboarding-block__question-answered" onClick={ onExpand }>
						{ displayValue }
					</button>
					<span>.</span>
				</>
			) }
		</div>
	</div>
);

export default Question;
