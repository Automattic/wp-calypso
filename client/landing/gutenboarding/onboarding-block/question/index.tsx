/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

interface QuestionProps {
	label: string;
	displayValue: string;
	children: React.ReactNode;
	isActive: boolean;
	onExpand: () => void;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */

const Question = ( { isActive, onExpand, displayValue, label, children }: QuestionProps ) => (
	<div
		className={ classNames( {
			'onboarding-block__question': true,
			selected: isActive,
		} ) }
	>
		<span>{ label }</span>
		<div className="">
			{ isActive ? (
				children
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
