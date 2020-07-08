/**
 * External Dependencies
 */
import { ReactNode } from 'react';

/**
 * The expected props for the loading component
 */
export type LoadingProps = {
	children?: ReactNode;
	variation?: string;
	isLoading?: boolean;
};
