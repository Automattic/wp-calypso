import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAgentUIContext } from '../../context/AgentUIContext.tsx';
import type { Suggestion } from '../../types';
import { cn } from '../../utils/classNames';
import { Button } from '../ui/button';
import { SuggestionDropdown } from './SuggestionDropdown';
import { fastSpringWithDelay } from '../animations';
import styles from './Suggestions.module.css';

export interface SuggestionsProps {
	className?: string;
	suggestions?: Suggestion[];
	onSubmit?: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	layout?: 'horizontal' | 'vertical' | 'floating';
	visible?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onDropdownOpenChange?: ( open: boolean ) => void;
	translateY?: string | number;
}

export const Suggestions: React.FC< SuggestionsProps > = ( {
	className,
	suggestions,
	onSubmit,
	layout = 'horizontal',
	visible = true,
	onMouseEnter,
	onMouseLeave,
	onDropdownOpenChange,
	translateY = '-100%',
} ) => {
	const { variant } = useAgentUIContext();

	// Limit suggestions for floating layout to prevent overflow
	const internalSuggestions = useMemo(
		() =>
			variant === 'floating' ? suggestions?.slice( 0, 3 ) : suggestions,
		[ suggestions, variant ]
	);

	const handleSuggestionClick = async (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => {
		let shouldSubmit = true;
		if ( selectedSuggestion.action ) {
			shouldSubmit = await selectedSuggestion.action();
		}

		if ( shouldSubmit && onSubmit && selectedSuggestion.prompt ) {
			onSubmit( selectedSuggestion, availableSuggestions );
		}
	};

	if ( ! internalSuggestions || internalSuggestions.length === 0 ) {
		return null;
	}

	return (
		<AnimatePresence>
			{ visible && (
				<motion.div
					data-slot="suggestions"
					className={ cn(
						styles.container,
						layout === 'vertical'
							? styles.vertical
							: layout === 'floating'
							? styles.floating
							: '',
						className
					) }
					initial={ { opacity: 0, y: '-80%' } }
					animate={ { opacity: 1, y: translateY } }
					exit={ { opacity: 0, y: '-80%' } }
					transition={ fastSpringWithDelay }
					onMouseEnter={ onMouseEnter }
					onMouseLeave={ onMouseLeave }
				>
					{ internalSuggestions.map(
						( suggestion: Suggestion, index: number ) => {
							const isEligibleForDescription =
								!! suggestion.description &&
								layout !== 'horizontal';

							return (
								<motion.div
									key={ suggestion.id }
									initial={ { opacity: 0, y: 10 } }
									animate={ { opacity: 1, y: 0 } }
									exit={ { opacity: 0, y: 10 } }
									transition={ {
										...fastSpringWithDelay,
										delay: index * 0.05,
									} }
								>
									{ suggestion.options &&
									suggestion.options.length > 0 ? (
										<SuggestionDropdown
											suggestion={ suggestion }
											onSelect={ handleSuggestionClick }
											availableSuggestions={
												internalSuggestions
											}
											onOpenChange={
												onDropdownOpenChange
											}
										/>
									) : (
										<Button
											onClick={ ( e ) => {
												e.stopPropagation();
												handleSuggestionClick(
													suggestion,
													internalSuggestions
												);
											} }
											variant="outline"
											className={ styles.button }
										>
											<div
												className={ cn(
													styles[
														'suggestion-content'
													],
													isEligibleForDescription
														? styles[
																'suggestion-content--with-description'
														  ]
														: ''
												) }
											>
												<span
													className={ styles.label }
												>
													{ suggestion.label }
												</span>
												{ isEligibleForDescription && (
													<span
														className={
															styles.description
														}
													>
														{
															suggestion.description
														}
													</span>
												) }
											</div>
										</Button>
									) }
								</motion.div>
							);
						}
					) }
				</motion.div>
			) }
		</AnimatePresence>
	);
};
