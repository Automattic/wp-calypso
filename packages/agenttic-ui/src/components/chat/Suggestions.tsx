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
	layout?: 'horizontal' | 'vertical' | 'floating';
	visible?: boolean;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
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
									variant="outline"
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
