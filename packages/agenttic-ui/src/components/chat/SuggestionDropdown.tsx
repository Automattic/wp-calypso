import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import type { Suggestion, SuggestionOption } from '../../types';
import { Button } from '../ui/button';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import styles from './SuggestionDropdown.module.css';
import suggestionStyles from './Suggestions.module.css';
import { cn } from '../../utils/classNames';

const combinePromptWithOption = ( prompt: string, optionValue: string ) => {
	if ( ! prompt || ! optionValue ) {
		return `${ prompt }${ optionValue }`;
	}

	if ( /\s$/.test( prompt ) || /^\s/.test( optionValue ) ) {
		return `${ prompt }${ optionValue }`;
	}

	return `${ prompt } ${ optionValue }`;
};

export interface SuggestionDropdownProps {
	suggestion: Suggestion;
	/**
	 * Called when an option is selected. Receives the combined suggestion
	 * (prompt + option.value with boundary whitespace normalized, options
	 * stripped). The parent is responsible for running `suggestion.action` and
	 * submitting — this keeps the action flow consistent with regular
	 * (non-dropdown) suggestions.
	 */
	onSelect?: (
		combinedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	availableSuggestions: Suggestion[];
	onOpenChange?: ( open: boolean ) => void;
	/** Render the suggestion's description under the label (vertical layout). */
	showDescription?: boolean;
}

export const SuggestionDropdown: React.FC< SuggestionDropdownProps > = ( {
	suggestion,
	onSelect,
	availableSuggestions,
	onOpenChange,
	showDescription,
} ) => {
	const [ open, setOpen ] = React.useState( false );
	const containerRef = React.useRef< HTMLDivElement | null >( null );
	const [ portalTarget, setPortalTarget ] =
		React.useState< HTMLElement | null >( null );
	const [ collisionBoundary, setCollisionBoundary ] =
		React.useState< HTMLElement | null >( null );
	const [ contentWidth, setContentWidth ] = React.useState<
		number | undefined
	>( undefined );

	// Resolve portal target and collision boundary via ref callback so they're
	// set synchronously when the container mounts. Nearest `.agenttic` ancestor
	// inherits theme CSS vars while escaping overflow clipping. If consumers use
	// `Suggestions` directly without an `.agenttic` wrapper, fall back to the
	// local container so the dropdown still renders.
	const setContainerNode = React.useCallback(
		( node: HTMLDivElement | null ) => {
			containerRef.current = node;
			if ( ! node ) {
				setPortalTarget( null );
				setCollisionBoundary( null );
				return;
			}

			setPortalTarget(
				node.closest< HTMLElement >( '.agenttic' ) ?? node
			);
			setCollisionBoundary(
				node.closest< HTMLElement >(
					'[data-slot="conversation-view"]'
				) ?? null
			);
		},
		[]
	);

	const updateOpen = React.useCallback(
		( nextOpen: boolean ) => {
			if ( nextOpen ) {
				const suggestionsEl =
					containerRef.current?.closest< HTMLElement >(
						'[data-slot="suggestions"]'
					);
				if ( suggestionsEl ) {
					setContentWidth( suggestionsEl.clientWidth * 0.9 );
				}
			}
			setOpen( nextOpen );
			onOpenChange?.( nextOpen );
		},
		[ onOpenChange ]
	);

	const handleOptionSelect = ( option: SuggestionOption ) => {
		const { options: _options, ...rest } = suggestion;
		const combinedSuggestion: Suggestion = {
			...rest,
			prompt: combinePromptWithOption(
				suggestion.prompt ?? suggestion.label,
				option.value
			),
			label: `${ suggestion.label } ${ option.label }`,
		};
		onSelect?.( combinedSuggestion, availableSuggestions );
		updateOpen( false );
	};

	return (
		<div ref={ setContainerNode } className={ styles.container }>
			<Popover.Root open={ open } onOpenChange={ updateOpen }>
				<Popover.Trigger asChild>
					<Button
						variant="outline"
						className={ suggestionStyles.button }
					>
						<div
							className={ cn(
								suggestionStyles[ 'suggestion-content' ],
								showDescription
									? suggestionStyles[
											'suggestion-content--with-description'
									  ]
									: ''
							) }
						>
							<span className={ styles.labelRow }>
								<span className={ suggestionStyles.label }>
									{ suggestion.label }
								</span>
								<ChevronDownIcon
									size={ 14 }
									className={ `${ styles.chevron } ${
										open ? styles.chevronOpen : ''
									}` }
								/>
							</span>
							{ showDescription && suggestion.description && (
								<span
									className={ suggestionStyles.description }
								>
									{ suggestion.description }
								</span>
							) }
						</div>
					</Button>
				</Popover.Trigger>
				{ portalTarget && (
					<Popover.Portal container={ portalTarget }>
						<Popover.Content
							className={ styles.dropdown }
							side="top"
							align="start"
							sideOffset={ 4 }
							collisionBoundary={ collisionBoundary }
							aria-label={ suggestion.label }
							style={
								contentWidth
									? { width: contentWidth }
									: undefined
							}
						>
							{ suggestion.options?.map( ( option ) => (
								<button
									key={ option.id }
									type="button"
									data-slot="suggestion-option"
									className={ styles.option }
									onClick={ () =>
										handleOptionSelect( option )
									}
								>
									{ option.label }
								</button>
							) ) }
						</Popover.Content>
					</Popover.Portal>
				) }
			</Popover.Root>
		</div>
	);
};
