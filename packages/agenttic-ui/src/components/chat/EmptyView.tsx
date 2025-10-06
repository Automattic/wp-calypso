import React from 'react';
import { __ } from '@wordpress/i18n';
import type { Suggestion } from '../../types';
import { Suggestions } from './Suggestions';
import styles from './EmptyView.module.css';

export interface EmptyViewProps {
	suggestions?: Suggestion[];
	onSuggestionClick?: ( prompt: string ) => void;
	icon?: React.ReactNode;
	heading?: string;
	help?: string;
}

export const EmptyView: React.FC< EmptyViewProps > = ( {
	suggestions,
	onSuggestionClick,
	icon = '✨',
	heading = __(
		'Your WordPress AI — ready to help design, edit, and launch.',
		'a8c-agenttic'
	),
	help,
} ) => {
	return (
		<div className={ styles.container }>
			<div className={ styles.icon }>{ icon }</div>
			<h2 className={ styles.heading }>{ heading }</h2>
			{ suggestions && suggestions.length > 0 && (
				<div className={ styles.suggestionsWrapper }>
					<Suggestions
						suggestions={ suggestions }
						onSubmit={ onSuggestionClick }
						translateY={ 0 }
					/>
				</div>
			) }
			{ help && <p className={ styles.help }>{ help }</p> }
		</div>
	);
};
