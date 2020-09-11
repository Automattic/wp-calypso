/**
 * External Dependencies
 */
import { ReactNode } from 'react';

/**
 * The expected props for the top-level experiment component
 */
export type ExperimentProps = {
	name: string;
	children: ReactNode;
	variation?: string;
	isLoading?: boolean;
};
