import { __ } from '@wordpress/i18n';
import React from 'react';
import { BigSkyIcon } from '../icons/BigSkyIcon';
import styles from './EmptyView.module.css';
import { Suggestions } from './Suggestions';
import type { Suggestion } from '../../types';

export interface EmptyViewProps {
	suggestions?: Suggestion[];
	onSuggestionClick?: (
		selectedSuggestion: Suggestion,
		availableSuggestions: Suggestion[]
	) => void;
	icon?: React.ReactNode;
	heading?: string;
	help?: string;
	/** Rendered where the suggestions go, instead of them. */
	children?: React.ReactNode;
}

export const EmptyView: React.FC< EmptyViewProps > = ( {
	suggestions,
	onSuggestionClick,
	icon = <BigSkyIcon size={ 32 } fullBleed className={ styles.defaultIcon } />,
	heading = __( 'Your WordPress AI — ready to help design, edit, and launch.', 'a8c-agenttic' ),
	help,
	children,
} ) => {
	return (
		<div className={ styles.container }>
			<div className={ styles.icon }>{ icon }</div>
			<h2 className={ styles.heading }>{ heading }</h2>
			{ children && <div className={ styles.suggestionsWrapper }>{ children }</div> }
			{ ! children && suggestions && suggestions.length > 0 && (
				<div className={ styles.suggestionsWrapper }>
					<Suggestions
						suggestions={ suggestions }
						onSubmit={ onSuggestionClick }
						translateY={ 0 }
						layout="vertical"
					/>
				</div>
			) }
			{ help && <p className={ styles.help }>{ help }</p> }
		</div>
	);
};
