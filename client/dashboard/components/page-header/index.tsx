import { SectionHeader } from '../section-header';
import type { PageHeaderProps } from './types';

/**
 * The PageHeader component provides a structured introduction to a page or section,
 * combining a title, optional description, and contextual actions. It can include
 * visual decorations, navigational aids like breadcrumbs, and utility controls
 * such as buttons or dropdowns.
 *
 * It's a thin wrapper around the SectionHeader component, primarily used for
 * semantic clarity.
 */
export const PageHeader = ( { breadcrumbs, ...rest }: PageHeaderProps ) => {
	return (
		<SectionHeader
			prefix={ breadcrumbs }
			{ ...rest }
			level={ 1 }
			className="dashboard-page-header"
		/>
	);
};
