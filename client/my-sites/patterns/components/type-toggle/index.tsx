import { useTranslate } from 'i18n-calypso';
import {
	PatternLibraryToggle,
	PatternLibraryToggleOption,
} from 'calypso/my-sites/patterns/components/toggle';
import { usePatternsContext } from 'calypso/my-sites/patterns/context';
import { getCategoryUrlPath } from 'calypso/my-sites/patterns/paths';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

import './style.scss';

type TypeToggleProps = {
	onChange?( value: PatternTypeFilter ): void;
};

export function TypeToggle( { onChange }: TypeToggleProps ) {
	const translate = useTranslate();
	const { category, isGridView, patternTypeFilter } = usePatternsContext();

	return (
		<PatternLibraryToggle onChange={ onChange } selected={ patternTypeFilter }>
			<PatternLibraryToggleOption
				className="pattern-library__type-toggle-option"
				href={ getCategoryUrlPath( category, PatternTypeFilter.REGULAR, false, isGridView ) }
				tooltipText={ translate( 'A collection of blocks that make up one section of a page', {
					comment: 'Tooltip for displaying regular patterns within a Pattern Library category',
					textOnly: true,
				} ) }
				value={ PatternTypeFilter.REGULAR }
			>
				{ translate( 'Patterns', {
					comment: 'Refers to block patterns',
				} ) }
			</PatternLibraryToggleOption>

			<PatternLibraryToggleOption
				className="pattern-library__type-toggle-option"
				href={ getCategoryUrlPath( category, PatternTypeFilter.PAGES, false, isGridView ) }
				tooltipText={ translate( 'A collection of patterns that form an entire page', {
					comment: 'Tooltip for displaying page patterns within a Pattern Library category',
					textOnly: true,
				} ) }
				value={ PatternTypeFilter.PAGES }
			>
				{ translate( 'Page Layouts', {
					comment: 'Refers to block patterns that contain entire page layouts',
				} ) }
			</PatternLibraryToggleOption>
		</PatternLibraryToggle>
	);
}
