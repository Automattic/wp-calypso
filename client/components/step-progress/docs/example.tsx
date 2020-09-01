/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import StepProgress from 'components/step-progress';

const StepProgressExample: FunctionComponent = () => (
	<StepProgress steps={ [ 'first', 'second', 'third' ] } />
);

export default StepProgressExample;
