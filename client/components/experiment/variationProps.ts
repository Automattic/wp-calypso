/**
 * External Dependencies
 */
import { ReactNode } from 'react';

/**
 * The expected props for variations
 */
export default interface VariationProps {
	name: string;
	children?: ReactNode;
	variation?: string;
	isLoading?: boolean;
}
