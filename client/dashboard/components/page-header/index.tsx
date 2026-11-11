import { useMatches } from '@tanstack/react-router';
import { createContext, isValidElement, useContext } from 'react';
import { SectionHeader } from '../section-header';
import type { PageHeaderProps } from './types';
import './style.scss';

type PageHeaderOverride = Pick< PageHeaderProps, 'title' | 'description' >;

/**
 * A title and description owned by a host that embeds these screens in chrome
 * of its own, such as a section whose tabs already name the current screen.
 * When provided, they replace the ones the page passes to its PageHeader.
 */
const PageHeaderOverrideContext = createContext< PageHeaderOverride | null >( null );

export function PageHeaderOverrideProvider( {
	children,
	title,
	description,
}: {
	children: React.ReactNode;
	title: React.ReactNode;
	description?: React.ReactNode;
} ) {
	return (
		<PageHeaderOverrideContext.Provider value={ { title, description } }>
			{ children }
		</PageHeaderOverrideContext.Provider>
	);
}

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
 * ActionMenu is a specialized wrapper around DropdownMenu for use in PageHeader actions.
 */
const ActionMenu = ( { children }: { children: React.ReactElement | null } ) => {
	if ( ! isValidElement( children ) ) {
		return null;
	}

	return <div style={ { marginInlineStart: 'auto' } }>{ children }</div>;
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
	const override = useContext( PageHeaderOverrideContext );

	return (
		<SectionHeader
			{ ...props }
			{ ...override }
			level={ 1 }
			title={ override?.title ?? props.title ?? <PageTitle /> }
			className="dashboard-page-header"
		/>
	);
};

PageHeader.ActionMenu = ActionMenu;
