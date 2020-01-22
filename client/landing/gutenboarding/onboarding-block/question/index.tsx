/**
 * External dependencies
 */
import React, { FunctionComponent, useState, useEffect } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import './style.scss';

interface Props {
	className?: string;
	displayValue: string;
	isActive?: boolean;
	label: string;
	onExpand: () => void;
}

/* eslint-disable wpcalypso/jsx-classname-namespace */

const Question: FunctionComponent< Props > = ( {
	children,
	className,
	displayValue,
	isActive,
	label,
	onExpand,
} ) => {
	// Persist activation of question so animation only happens on mount.
	const [ hasActivated, setHasActivated ] = useState< boolean >( false );
	useEffect( () => {
		setHasActivated( true );
	}, [] );

	return (
		<div
			className={ classNames( 'onboarding-block__question', className, {
				selected: hasActivated,
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
};

export default Question;
