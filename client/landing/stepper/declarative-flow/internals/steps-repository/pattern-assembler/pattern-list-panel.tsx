import { Button } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
import { injectTitlesToPageListBlock } from './html-transformers';
import PatternSelector from './pattern-selector';
import { isPriorityPattern } from './utils';
import type { Pattern, Category } from './types';
import './pattern-list-panel.scss';

type PatternListPanelProps = {
	onSelect: ( selectedPattern: Pattern | null ) => void;
	selectedPattern: Pattern | null;
	categories: Category[];
	selectedCategory: string | null;
	patternsMapByCategory: { [ key: string ]: Pattern[] };
	selectedPatterns?: Pattern[];
	pages?: Pattern[];
	label?: string;
	description?: string;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
	isNewSite: boolean;
};

const PatternListPanel = ( {
	selectedPattern,
	selectedPatterns,
	selectedCategory,
	categories,
	patternsMapByCategory,
	pages,
	label,
	description,
	onSelect,
	recordTracksEvent,
	isNewSite,
}: PatternListPanelProps ) => {
	const translate = useTranslate();
	const [ isShowMorePatterns, setIsShowMorePatterns ] = useState( false );
	const categoryPatterns = selectedCategory ? patternsMapByCategory[ selectedCategory ] : [];
	const category = useMemo(
		() => selectedCategory && categories.find( ( { name } ) => name === selectedCategory ),
		[ categories, selectedCategory ]
	);

	const hasNonPriorityPatterns = categoryPatterns?.find(
		( pattern ) => ! isPriorityPattern( pattern )
	);

	const transformPatternHtml = useCallback(
		( patternHtml: string ) => {
			const pageTitles = pages?.map( ( page ) => page.title );
			const isCategoryHeader = category && category.name === 'header';
			if ( isCategoryHeader && pageTitles ) {
				return injectTitlesToPageListBlock( patternHtml, pageTitles, {
					replaceCurrentPages: isNewSite,
				} );
			}
			return patternHtml;
		},
		[ isNewSite, pages, category ]
	);

	if ( ! category ) {
		return null;
	}

	return (
		<div key="pattern-list-panel" className="pattern-list-panel__wrapper">
			<div className="pattern-list-panel__title">{ label ?? category?.label }</div>
			<div className="pattern-list-panel__description">
				{ description ?? category?.description }
			</div>
			<PatternSelector
				patterns={ categoryPatterns }
				onSelect={ onSelect }
				selectedPattern={ selectedPattern }
				selectedPatterns={ selectedPatterns }
				transformPatternHtml={ transformPatternHtml }
				isShowMorePatterns={ isShowMorePatterns }
			/>
			{ ! isShowMorePatterns && hasNonPriorityPatterns && (
				<div className="pattern-list-panel__show-more">
					<Button
						onClick={ () => {
							recordTracksEvent( PATTERN_ASSEMBLER_EVENTS.PATTERN_SHOW_MORE_CLICK, {
								category: selectedCategory,
							} );
							setIsShowMorePatterns( true );
						} }
						icon={ chevronDown }
						iconSize={ 23 }
						iconPosition="right"
						text={ translate( 'Show more patterns' ) }
					/>
				</div>
			) }
		</div>
	);
};

export default PatternListPanel;
