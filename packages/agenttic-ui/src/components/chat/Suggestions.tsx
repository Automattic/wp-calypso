import React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/classNames';
import { STORE_NAME } from '../../store';
import type { StoreActions, StoreSelectors, Suggestion } from '../../types';
import { Button } from '../ui/button';
import { fadeVariants, fastSpringWithDelay } from '../animations';
import styles from './Suggestions.module.css';

interface SuggestionsProps {
	className?: string;
}

export const Suggestions: React.FC< SuggestionsProps > = ( { className } ) => {
	const { setInputValue } = useDispatch( STORE_NAME ) as StoreActions;

	const suggestions = useSelect( ( select ) => {
		const store = select( STORE_NAME ) as StoreSelectors;
		return store.getSuggestions();
	}, [] );

	const handleSuggestionClick = ( suggestion: Suggestion ) => {
		setInputValue( suggestion.prompt );
	};

	if ( ! suggestions || suggestions.length === 0 ) {
		return null;
	}

	return (
		<AnimatePresence>
			{ suggestions && suggestions.length > 0 && (
				<motion.div
					className={ cn( styles.container, className ) }
					initial={ { opacity: 0, y: '-80%' } }
					animate={ { opacity: 1, y: '-100%' } }
					exit={ { opacity: 0, y: '-80%' } }
					transition={ fastSpringWithDelay }
				>
					{ suggestions.map(
						( suggestion: Suggestion, index: number ) => (
							<motion.div
								key={ suggestion.id }
								initial={ { opacity: 0, y: 10 } }
								animate={ { opacity: 1, y: 0 } }
								transition={ {
									...fastSpringWithDelay,
									delay: index * 0.05,
								} }
							>
								<Button
									onClick={ () =>
										handleSuggestionClick( suggestion )
									}
									variant="outline"
									size="sm"
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
