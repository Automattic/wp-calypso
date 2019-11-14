/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	displayValue: string;
	isActive: boolean;
	label: string;
	onExpand: () => void;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */

const Question: FunctionComponent< Props > = ( {
	isActive,
	onExpand,
	displayValue,
	label,
	children,
} ) => (
	<div
		className={ classNames( 'onboarding-block__question', {
			selected: isActive,
		} ) }
	>
		<span>{ label }</span>
		<div>
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
