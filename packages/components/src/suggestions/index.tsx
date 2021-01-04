/**
 * External dependencies
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { find, groupBy, isEqual, partition, property, noop } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Item from './item';

/**
 * Style depenedencies
 */
import './style.scss';

type Suggestion = { label: string; category?: string };

type CategorizedSuggestions = {
	category?: string;
	categoryKey: string;
	suggestions: ( Suggestion & {
		originalIndex: number;
		index: number;
	} )[];
}[];

interface Props {
	query?: string;
	suggestions: Suggestion[];
	suggest: ( suggestion: Suggestion, index: number ) => void;
	railcar: unknown;
	title: string;
	className?: string;
	onSuggestionItemMount?: ( arg: { suggestionIndex: number; index: number } ) => void;
}

interface State {
	lastSuggestions: null | Suggestion[];
	suggestionPosition: number;
}

class Suggestions extends Component< Props, State > {
	static defaultProps = {
		query: '',
		onSuggestionItemMount: noop,
	};

	state = {
		lastSuggestions: null,
		suggestionPosition: 0,
	};

	refsCollection: Record< string, Item | null > = {};

	static getDerivedStateFromProps( props: Props, state: State ): State | null {
		if ( isEqual( props.suggestions, state.lastSuggestions ) ) {
			return null;
		}

		return {
			lastSuggestions: props.suggestions,
			suggestionPosition: 0,
		};
	}

	getSuggestionsCount = (): number => this.props.suggestions.length;

	getOriginalIndexFromPosition = ( index: number ): number =>
		this.getCategories().reduce( ( foundIndex, category ) => {
			if ( foundIndex !== -1 ) return foundIndex;

			const suggestion = find( category.suggestions, { index } );
			return suggestion ? suggestion.originalIndex : -1;
		}, -1 );

	suggest = ( originalIndex: number ): void =>
		this.props.suggest( this.props.suggestions[ originalIndex ], originalIndex );

	moveSelectionDown = (): void => {
		const position = ( this.state.suggestionPosition + 1 ) % this.getSuggestionsCount();
		const element = ReactDOM.findDOMNode( this.refsCollection[ 'suggestion_' + position ] );
		if ( element instanceof Element ) {
			element.scrollIntoView( { block: 'nearest' } );
		}

		this.changePosition( position );
	};

	moveSelectionUp = (): void => {
		const position =
			( this.state.suggestionPosition - 1 + this.getSuggestionsCount() ) %
			this.getSuggestionsCount();
		const element = ReactDOM.findDOMNode( this.refsCollection[ 'suggestion_' + position ] );
		if ( element instanceof Element ) {
			element.scrollIntoView( { block: 'nearest' } );
		}

		this.changePosition( position );
	};

	changePosition = ( position: number ): void =>
		this.setState( {
			suggestionPosition: position,
		} );

	handleKeyEvent = ( event: KeyboardEvent ): void => {
		if ( this.getSuggestionsCount() === 0 ) {
			return;
		}

		switch ( event.key ) {
			case 'ArrowDown':
				this.moveSelectionDown();
				event.preventDefault();
				break;

			case 'ArrowUp':
				this.moveSelectionUp();
				event.preventDefault();
				break;

			case 'Enter':
				this.state.suggestionPosition >= 0 &&
					this.suggest( this.getOriginalIndexFromPosition( this.state.suggestionPosition ) );
				break;
		}
	};

	handleMouseDown = ( originalIndex: number ): void => {
		this.suggest( originalIndex );
	};

	handleMouseOver = ( suggestionPosition: number ): void => this.setState( { suggestionPosition } );

	getCategories(): CategorizedSuggestions {
		// We need to remember the original index of the suggestion according to the
		// `suggestions` prop for tracks and firing callbacks.
		const withOriginalIndex = this.props.suggestions.map( ( suggestion, originalIndex ) => ( {
			...suggestion,
			// this will be updated later on in this function
			index: originalIndex,
			originalIndex,
		} ) );

		const [ withCategory, withoutCategory ] = partition(
			withOriginalIndex,
			( suggestion ) => !! suggestion.category
		);

		// For all intents and purposes `groupBy` keeps the order stable
		// https://github.com/lodash/lodash/issues/2212
		const byCategory = groupBy( withCategory, property( 'category' ) );

		const categories: CategorizedSuggestions = Object.entries( byCategory ).map(
			( [ category, suggestions ] ) => ( {
				category,
				categoryKey: category,
				suggestions,
			} )
		);

		// Add uncategorised suggestions to the front, they always appear at
		// the top of the list.
		categories.unshift( {
			categoryKey: '## Uncategorized ##',
			suggestions: withoutCategory,
		} );

		let order = 0;
		for ( const category of categories ) {
			for ( const suggestion of category.suggestions ) {
				suggestion.index = order++;
			}
		}

		return categories;
	}

	render(): JSX.Element | null {
		const { query, className, title } = this.props;
		const containerClass = classnames( 'suggestions', className );

		if ( ! this.getSuggestionsCount() ) {
			return null;
		}

		return (
			<div className={ containerClass }>
				{ title ? <div className="suggestions__title">{ title }</div> : null }
				{ this.getCategories().map( ( { category, categoryKey, suggestions }, categoryIndex ) => (
					<React.Fragment key={ categoryKey }>
						{ ! categoryIndex ? null : (
							<div className="suggestions__category-heading">{ category }</div>
						) }
						{ suggestions.map( ( { index, label, originalIndex } ) => (
							// The parent component should handle key events and forward them to
							// this component. See ./README.md for details.
							// eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
							<Item
								key={ originalIndex }
								hasHighlight={ index === this.state.suggestionPosition }
								query={ query }
								onMount={ () =>
									this.props.onSuggestionItemMount?.( {
										suggestionIndex: originalIndex,
										index,
									} )
								}
								onMouseDown={ () => this.handleMouseDown( originalIndex ) }
								onMouseOver={ () => this.handleMouseOver( index ) }
								label={ label }
								ref={ ( suggestion ) => {
									this.refsCollection[ 'suggestion_' + index ] = suggestion;
								} }
							/>
						) ) }
					</React.Fragment>
				) ) }
			</div>
		);
	}
}

export default Suggestions;
