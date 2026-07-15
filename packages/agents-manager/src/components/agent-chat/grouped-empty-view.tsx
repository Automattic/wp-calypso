import { EmptyView, Suggestions, type Suggestion } from '@automattic/agenttic-ui';
import { useInstanceId } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import { Icon, chevronDown, chevronLeft, chevronRight } from '@wordpress/icons';
import {
	DESIGN_SUGGESTION_IDS,
	getWritingSuggestionLabel,
	GROUPED_VIEW_HIDDEN_SUGGESTION_IDS,
	WRITING_SUGGESTION_IDS,
} from '../../hooks/use-empty-view-suggestions';
import { isEditorPage } from '../../utils/is-editor-page';
import type { ReactNode } from 'react';
import './grouped-empty-view.scss';

interface Props {
	heading: string;
	help?: string;
	icon: ReactNode;
	suggestions: Suggestion[];
	groupWritingSuggestions: boolean;
	onSuggestionClick?: (
		selectedSuggestion: Suggestion | string,
		availableSuggestions?: Suggestion[]
	) => void;
}

export default function GroupedEmptyView( {
	heading,
	help,
	icon,
	suggestions,
	groupWritingSuggestions,
	onSuggestionClick,
}: Props ) {
	const [ isWritingExpanded, setIsWritingExpanded ] = useState( false );
	const writingSuggestionListId = useInstanceId(
		GroupedEmptyView,
		'agents-manager-writing-suggestion-list'
	);
	const shouldFormatWritingSuggestions = groupWritingSuggestions || isEditorPage();
	const displaySuggestions = suggestions.map( ( suggestion ) =>
		shouldFormatWritingSuggestions && WRITING_SUGGESTION_IDS.has( suggestion.id )
			? { ...suggestion, label: getWritingSuggestionLabel( suggestion ) }
			: suggestion
	);
	const writingSuggestions = displaySuggestions.filter( ( suggestion ) =>
		WRITING_SUGGESTION_IDS.has( suggestion.id )
	);
	// Grouping only helps when writing and design actions need separation.
	const hasDesignSuggestions = suggestions.some( ( suggestion ) =>
		DESIGN_SUGGESTION_IDS.has( suggestion.id )
	);
	const handleSuggestionClick = ( selectedSuggestion: Suggestion | string ) => {
		const originalSuggestion =
			typeof selectedSuggestion === 'string'
				? selectedSuggestion
				: suggestions.find( ( suggestion ) => suggestion.id === selectedSuggestion.id ) ??
				  selectedSuggestion;
		onSuggestionClick?.( originalSuggestion, suggestions );
	};

	if ( ! groupWritingSuggestions || writingSuggestions.length === 0 || ! hasDesignSuggestions ) {
		return (
			<EmptyView
				heading={ heading }
				help={ help }
				suggestions={ displaySuggestions }
				onSuggestionClick={ handleSuggestionClick }
				icon={ icon }
			/>
		);
	}

	const topLevelSuggestions = displaySuggestions.filter(
		( suggestion ) =>
			! WRITING_SUGGESTION_IDS.has( suggestion.id ) &&
			! GROUPED_VIEW_HIDDEN_SUGGESTION_IDS.has( suggestion.id )
	);
	const collapsedIcon = isRTL() ? chevronLeft : chevronRight;

	return (
		<div className="agents-manager-grouped-empty-view">
			<EmptyView
				heading={ heading }
				suggestions={ topLevelSuggestions }
				onSuggestionClick={ handleSuggestionClick }
				icon={ icon }
			/>
			<section className="agents-manager-writing-suggestions">
				<button
					type="button"
					className="agents-manager-writing-suggestions__toggle"
					aria-expanded={ isWritingExpanded }
					aria-controls={ writingSuggestionListId }
					onClick={ () => setIsWritingExpanded( ( isExpanded ) => ! isExpanded ) }
				>
					<span className="agents-manager-writing-suggestions__content">
						<span className="agents-manager-writing-suggestions__title">
							{ __( 'Writing', __i18n_text_domain__ ) }
						</span>
						<span className="agents-manager-writing-suggestions__description">
							{ __( 'Improve and refine your content.', __i18n_text_domain__ ) }
						</span>
					</span>
					<span className="agents-manager-writing-suggestions__count">
						{ writingSuggestions.length }
					</span>
					<Icon
						className="agents-manager-writing-suggestions__chevron"
						icon={ isWritingExpanded ? chevronDown : collapsedIcon }
						size={ 20 }
					/>
				</button>
				<div id={ writingSuggestionListId } hidden={ ! isWritingExpanded }>
					<Suggestions
						className="agents-manager-writing-suggestions__list"
						layout="vertical"
						translateY={ 0 }
						suggestions={ writingSuggestions }
						onSubmit={ handleSuggestionClick }
					/>
				</div>
			</section>
			{ help && <p className="agents-manager-grouped-empty-view__help">{ help }</p> }
		</div>
	);
}
