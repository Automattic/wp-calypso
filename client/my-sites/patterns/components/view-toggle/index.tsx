import { Icon, category as iconCategory, menu as iconMenu } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import {
	PatternLibraryToggle,
	PatternLibraryToggleOption,
} from 'calypso/my-sites/patterns/components/toggle';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter, PatternView } from 'calypso/my-sites/patterns/types';

import './style.scss';

// On the client, the URL query string may contain a search term. If so, we want to preserve that
function getViewToggleUrlPath(
	category: string,
	patternTypeFilter: PatternTypeFilter,
	isGridView: boolean
): string {
	if ( typeof window !== 'undefined' ) {
		const url = new URL( window.location.href );
		url.searchParams.delete( 'grid' );

		if ( isGridView ) {
			url.searchParams.set( 'grid', '1' );
		}

		return url.toString();
	}

	return getCategoryUrlPath( category, patternTypeFilter, false, isGridView );
}

type ViewToggleProps = {
	onChange?( value: PatternView ): void;
};

export function ViewToggle( { onChange }: ViewToggleProps ) {
	const translate = useTranslate();
	const { category, isGridView, patternTypeFilter } = usePatternsContext();
	const currentView = isGridView ? 'grid' : 'list';

	const listViewLabel = translate( 'List view', {
		comment: 'Toggle label for view switcher in the Pattern Library',
		textOnly: true,
	} );

	const gridViewLabel = translate( 'Grid view', {
		comment: 'Toggle label for view switcher in the Pattern Library',
		textOnly: true,
	} );

	return (
		<PatternLibraryToggle
			className="pattern-library__view-toggle"
			onChange={ onChange }
			selected={ currentView }
		>
			<PatternLibraryToggleOption
				aria-label={ listViewLabel }
				href={ getViewToggleUrlPath( category, patternTypeFilter, false ) }
				tooltipText={ listViewLabel }
				value="list"
			>
				<Icon icon={ iconMenu } size={ 20 } />
			</PatternLibraryToggleOption>

			<PatternLibraryToggleOption
				aria-label={ gridViewLabel }
				href={ getViewToggleUrlPath( category, patternTypeFilter, true ) }
				tooltipText={ gridViewLabel }
				value="grid"
			>
				<Icon icon={ iconCategory } size={ 20 } />
			</PatternLibraryToggleOption>
		</PatternLibraryToggle>
	);
}
