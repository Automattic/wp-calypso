import { useRouteMatch } from 'react-router-dom';
import { steps } from './steps';
import type { StepType } from './types';

const routeFragments = {
	step: `:step(${ steps.join( '|' ) })`,
};

export const path = [ '', ...Object.values( routeFragments ) ].join( '/' );

export function useStepRouteParam() {
	const match = useRouteMatch< { step?: string } >( path );
	return match?.params.step as StepType;
}
