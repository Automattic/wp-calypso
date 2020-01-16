/**
 * External Dependencies
 */
import { ReactNode } from 'react';

/**
 * The expected props for variations
 */
export type VariationProps = {
	name: string;
	children?: ReactNode;
	variation?: string;
	isLoading?: boolean;
};
