/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useSpring, animated } from 'react-spring';
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
	const springProps = useSpring( {
		opacity: 1,
		fontSize: isActive ? 40 : 28, // transition to a bigger font when the question is active
		from: { opacity: 0 }, // fade in when mounting
	} );

	return (
		<animated.div
			style={ springProps }
			className={ classNames( 'onboarding-block__question', className ) }
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
		</animated.div>
	);
};
export default Question;
