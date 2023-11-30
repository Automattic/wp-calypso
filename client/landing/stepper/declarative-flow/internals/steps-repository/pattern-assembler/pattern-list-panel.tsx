import { Button } from '@wordpress/components';
import { chevronDown } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import { PATTERN_ASSEMBLER_EVENTS } from './events';
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
	label?: string;
	description?: string;
	recordTracksEvent: ( name: string, eventProperties?: any ) => void;
};

const PatternListPanel = ( {
	selectedPattern,
	selectedPatterns,
	selectedCategory,
	categories,
	patternsMapByCategory,
	label,
	description,
	onSelect,
	recordTracksEvent,
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
