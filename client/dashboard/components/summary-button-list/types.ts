import { ReactElement } from 'react';
import type { Density } from '@automattic/components/src/summary-button/types';

type ChildType = ReactElement< { density?: string } >;
export interface SummaryButtonListProps {
	/**
	 * The main label that identifies the section.
	 */
	title?: string;
	/**
	 * Optional supporting text that provides additional context or detail about the section.
	 */
	description?: string;
	/**
	 * The density of the component. This affects both the container styling
	 * and the density of child SummaryButton components. It should be one of the `Density` values
	 * from the SummaryButton component ('low|medium').
	 * @default 'medium'
	 */
	density?: Density;
	/**
	 * The child components should be either SummaryButton instances or components that
	 * wrap SummaryButton internally and pass the `density` prop to them. This is because
	 * the component will override the 'density' prop of these children to match the parent's density.
	 */
	children: ChildType | ChildType[];
}
