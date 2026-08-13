import { __ } from '@wordpress/i18n';
import { DataViewsEmptyStateLayout } from 'calypso/dashboard/components/dataviews';
import { getSelectedFilters } from './get-selected-filters';
import type { Filter } from '@wordpress/dataviews';

export type SitesViewName = 'all' | 'needs-attention' | 'development' | 'favorites';

export interface SitesEmptyStateOptions {
	filters?: Filter[];
	search?: string;
	showOnlyFavorites?: boolean;
	showOnlyDevelopmentSites?: boolean;
}

interface SitesEmptyStateCopy {
	title: string;
	description: string;
}

export function getSitesViewName( {
	filters = [],
	showOnlyFavorites = false,
	showOnlyDevelopmentSites = false,
}: SitesEmptyStateOptions ): SitesViewName {
	if ( showOnlyFavorites ) {
		return 'favorites';
	}

	if ( showOnlyDevelopmentSites ) {
		return 'development';
	}

	if ( getSelectedFilters( filters ).includes( 'all_issues' ) ) {
		return 'needs-attention';
	}

	return 'all';
}

export function getSitesEmptyStateCopy( options: SitesEmptyStateOptions ): SitesEmptyStateCopy {
	const { filters = [], search = '' } = options;
	const view = getSitesViewName( options );

	const issueTypes = getSelectedFilters( filters );
	// "Needs attention" *is* the all_issues filter, so it never counts as a user-applied refinement.
	const refiningFilters =
		view === 'needs-attention'
			? issueTypes.filter( ( issueType ) => issueType !== 'all_issues' )
			: issueTypes;

	const hasSearch = search.trim() !== '';
	const hasFilters = refiningFilters.length > 0;

	if ( hasSearch || hasFilters ) {
		if ( hasSearch && hasFilters ) {
			return {
				title: __( 'No sites match your search' ),
				description: __( 'Try a different search term, or clear your filters.' ),
			};
		}

		if ( hasSearch ) {
			return {
				title: __( 'No sites match your search' ),
				description: __( 'Try a different search term.' ),
			};
		}

		return {
			title: __( 'No sites match your filters' ),
			description: __( 'Try changing or clearing your filters.' ),
		};
	}

	switch ( view ) {
		case 'needs-attention':
			return {
				title: __( 'Nothing needs your attention' ),
				description: __(
					'Empty is the goal here. If a site goes down, a backup fails, or a threat turns up, it lands in this list.'
				),
			};
		case 'development':
			return {
				title: __( 'No sites in development' ),
				description: __(
					'Sites you’re still building carry the Development tag and gather here. Launch one and it moves out of this list.'
				),
			};
		case 'favorites':
			return {
				title: __( 'No favorites yet' ),
				description: __(
					'Select the star on any site to add it here, so the ones you check most often stay together.'
				),
			};
		default:
			return {
				title: __( 'Your sites will show up here' ),
				description: __(
					'Every site you add to Automattic for Agencies joins this list, with its stats, backups, and security at a glance.'
				),
			};
	}
}

export default function SitesEmptyState( options: SitesEmptyStateOptions ) {
	const { title, description } = getSitesEmptyStateCopy( options );

	return <DataViewsEmptyStateLayout title={ title } description={ description } isBorderless />;
}
