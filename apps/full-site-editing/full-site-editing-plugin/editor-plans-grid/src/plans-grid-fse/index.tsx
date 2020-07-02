/**
 * External dependencies
 */
import * as React from 'react';

/**
 * Internal dependencies
 */
import PlansGrid, { Props as PlansGridProps } from '@automattic/plans-grid';
import { useSelectedPlan } from '../hooks/use-selected-plan';

export type Props = Partial< PlansGridProps >;

const PlansGridFSE: React.FunctionComponent< Props > = ( { ...props } ) => {
	// TODO: Get current domain from launch store.
	const currentDomain = undefined;

	const currentPlan = useSelectedPlan();

	return <PlansGrid currentDomain={ currentDomain } currentPlan={ currentPlan } { ...props } />;
};

export default PlansGridFSE;
