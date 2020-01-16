/**
 * External Dependencies
 */
import { ReactNode } from 'react';

/**
 * The expected props for the top-level experiment component
 */
export default interface ExperimentProps {
	name: string;
	children: ReactNode;
	variation?: string;
	isLoading?: boolean;
}
