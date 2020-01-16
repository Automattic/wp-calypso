/**
 * External Dependencies
 */
import { ReactNode } from 'react';

/**
 * The expected props for the loading component
 */
export default interface LoadingProps {
	children?: ReactNode;
	variation?: string;
	isLoading?: boolean;
}
