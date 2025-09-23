import { useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { SectionHeader } from '../section-header';
import type { PageHeaderProps } from './types';

const usePageTitle = () => {
	const routeMeta = useRouterState( {
		select: ( state ) => state.matches.map( ( match ) => match.meta ).filter( Boolean ),
	} );

	const title = useMemo( () => {
		return routeMeta
			.map( ( metas ) => metas?.find( ( meta ) => meta?.title )?.title )
			.reverse()
			.find( ( value ) => !! value );
	}, [ routeMeta ] );

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
 */
export const PageHeader = ( { title, ...props }: PageHeaderProps ) => {
	const defaultPageTitle = usePageTitle();

	return (
		<SectionHeader
			{ ...props }
			title={ title ?? defaultPageTitle }
			level={ 1 }
			className="dashboard-page-header"
		/>
	);
};
