import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAgentUIContext } from '../../context/AgentUIContext.tsx';
import type { Suggestion } from '../../types';
import { cn } from '../../utils/classNames';
import { Button } from '../ui/button';
import { fastSpringWithDelay } from '../animations';
import styles from './Suggestions.module.css';

export interface SuggestionsProps {
	className?: string;
	suggestions?: Suggestion[];
	onSubmit?: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	layout?: 'floating' | 'vertical';
	visible?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	translateY?: string | number;
}

export const Suggestions: React.FC< SuggestionsProps > = ( {
	className,
	suggestions,
	onSubmit,
	layout = 'vertical',
	visible = true,
	onMouseEnter,
	onMouseLeave,
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
			{ internalSuggestions &&
				internalSuggestions.length > 0 &&
				visible && (
					<motion.div
						className={ cn(
							styles.container,
							layout === 'floating'
								? styles.floating
								: styles.vertical,
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
							( suggestion: Suggestion, index: number ) => (
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
									<Button
										onClick={ ( e ) => {
											e.stopPropagation();
											handleSuggestionClick(
												suggestion,
												internalSuggestions
											);
										} }
										variant={
											layout === 'floating'
												? 'transparent'
												: 'outline'
										}
										size={
											layout === 'floating'
												? 'lg'
												: undefined
										}
										className={ styles.button }
									>
										{ suggestion.label }
									</Button>
								</motion.div>
							)
						) }
					</motion.div>
				) }
		</AnimatePresence>
	);
};
