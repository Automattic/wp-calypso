/**
 * External dependencies
 */
import React, { ReactComponent, ReactNode } from 'react';

/**
 * @typedef RenderSwitchArgs
 */
type RenderSwitchArgs = {
	loadingCondition: () => boolean;
	renderCondition: () => boolean;
	queryComponent?: ReactNode;
	loadingComponent?: ReactNode;
	trueComponent?: ReactNode;
	falseComponent?: ReactNode;
};

/**
 * Renders one option or another based on a boolean condition,
 * optionally after a query has completed.
 *
 * @param {RenderSwitchArgs} props - The component properties.
 * @param {Function}  props.loadingCondition - Returns true if more information is required to make a render decision; false, otherwise.
 * @param {Function}  props.renderCondition - Returns true if trueComponent should be rendered, and false if falseComponent should be rendered.
 * @param {ReactNode} [props.queryComponent] - The component responsible for loading data to make a render decision.
 * @param {ReactNode} [props.loadingComponent] - The component to render while data is still loading.
 * @param {ReactNode} [props.trueComponent] - The component to render when the renderCondition evaluates to true.
 * @param {ReactNode} [props.falseComponent] - The component to render when the renderCondition evaluates to false.
 */
const RenderSwitch: ReactComponent = ( {
	loadingCondition,
	renderCondition,
	queryComponent,
	loadingComponent,
	trueComponent,
	falseComponent,
}: RenderSwitchArgs ) => {
	if ( loadingCondition() ) {
		return (
			<>
				{ queryComponent }
				{ loadingComponent }
			</>
		);
	}

	return ( renderCondition() ? trueComponent : falseComponent ) || null;
};

export default RenderSwitch;
