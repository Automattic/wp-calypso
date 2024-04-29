import { Icon, category as iconCategory, menu as iconMenu } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import {
	PatternLibraryToggle,
	PatternLibraryToggleOption,
} from 'calypso/my-sites/patterns/components/toggle';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { QUERY_PARAM_SEARCH } from 'calypso/my-sites/patterns/lib/filter-patterns-by-term';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter, PatternView } from 'calypso/my-sites/patterns/types';

import './style.scss';

function getViewToggleUrlPath(
	category: string,
	patternTypeFilter: PatternTypeFilter,
	isGridView: boolean,
	searchTerm: string
): string {
	const path = getCategoryUrlPath( category, patternTypeFilter, false );
	const params = new URLSearchParams();

	if ( isGridView ) {
		params.set( 'grid', '1' );
	}

	if ( searchTerm ) {
		params.set( QUERY_PARAM_SEARCH, searchTerm );
	}

	return params.size ? `${ path }?${ params }` : path;
}

type ViewToggleProps = {
	onChange?( value: PatternView ): void;
};

export function ViewToggle( { onChange }: ViewToggleProps ) {
	const translate = useTranslate();
	const { category, isGridView, patternTypeFilter, searchTerm } = usePatternsContext();
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
				href={ getViewToggleUrlPath( category, patternTypeFilter, false, searchTerm ) }
				tooltipText={ listViewLabel }
				value="list"
			>
				<Icon icon={ iconMenu } size={ 20 } />
			</PatternLibraryToggleOption>

			<PatternLibraryToggleOption
				aria-label={ gridViewLabel }
				href={ getViewToggleUrlPath( category, patternTypeFilter, true, searchTerm ) }
				tooltipText={ gridViewLabel }
				value="grid"
			>
				<Icon icon={ iconCategory } size={ 20 } />
			</PatternLibraryToggleOption>
		</PatternLibraryToggle>
	);
}
