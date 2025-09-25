import { useMatches } from '@tanstack/react-router';
import { SectionHeader } from '../section-header';
import type { PageHeaderProps } from './types';

const PageTitle = () => {
	const title = useMatches( {
		select: ( matches ) =>
			matches
				.map( ( match ) => match.meta?.find( ( meta ) => meta?.title )?.title )
				.findLast( ( value ) => typeof value !== 'undefined' ),
	} );

	return title;
};

/**
 * The PageHeader component provides a structured introduction to a page or section,
 * combining a title, optional description, and contextual actions. It can include
 * visual decorations, navigational aids like breadcrumbs, and utility controls
 * such as buttons or dropdowns.
 *
 * It's a thin wrapper around the SectionHeader component, primarily used for
 * semantic clarity.
 *
 * Also, it automatically sets a default title by retrieving it from the meta property
 * of the last matched route.
 */
export const PageHeader = ( props: PageHeaderProps ) => {
	return (
		<SectionHeader
			{ ...props }
			level={ 1 }
			title={ props.title ?? <PageTitle /> }
			className="dashboard-page-header"
		/>
	);
};
