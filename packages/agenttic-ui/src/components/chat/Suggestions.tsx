import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Suggestion } from '../../types';
import { cn } from '../../utils/classNames';
import { Button } from '../ui/button';
import { fastSpringWithDelay } from '../animations';
import styles from './Suggestions.module.css';

export interface SuggestionsProps {
	className?: string;
	suggestions?: Suggestion[];
	onSubmit?: ( message: string ) => void;
	layout?: 'horizontal' | 'vertical';
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
	const handleSuggestionClick = ( suggestion: Suggestion ) => {
		if ( onSubmit && suggestion.prompt ) {
			onSubmit( suggestion.prompt );
		} else if ( suggestion.action ) {
			suggestion.action();
		}
	};

	if ( ! suggestions || suggestions.length === 0 ) {
		return null;
	}

	return (
		<AnimatePresence>
			{ suggestions && suggestions.length > 0 && visible && (
				<motion.div
					className={ cn(
						styles.container,
						layout === 'vertical' ? styles.vertical : '',
						className
					) }
					initial={ { opacity: 0, y: '-80%' } }
					animate={ { opacity: 1, y: translateY } }
					exit={ { opacity: 0, y: '-80%' } }
					transition={ fastSpringWithDelay }
					onMouseEnter={ onMouseEnter }
					onMouseLeave={ onMouseLeave }
				>
					{ suggestions.map(
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
									onClick={ () =>
										handleSuggestionClick( suggestion )
									}
									variant={
										layout === 'vertical'
											? 'transparent'
											: 'outline'
									}
									size={
										layout === 'vertical' ? 'lg' : undefined
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
