/**
 * External dependencies
 */
import React, { Component, ReactInstance } from 'react';
import ReactDOM from 'react-dom';
import { find, groupBy, isEqual, partition, property } from 'lodash';

/**
 * Internal dependencies
 */
import Item from './item';

/**
 * Style depenedencies
 */
import './style.scss';

interface Suggestion {
	category?: string;
	label: string;
}

type SuggestHandler = ( { suggestion: Suggestion, originalIndex: number } ) => void;

interface Props {
	onSuggestionItemMount: ( args: { suggestionIndex: number; index: number } ) => void;
	query: string;
	suggest: SuggestHandler;
	suggestions: Suggestion[];
}

interface State {
	lastSuggestions: null | Suggestion[];
	suggestionPosition: number;
}

class Suggestions extends Component< Props, State > {
	static defaultProps = {
		onSuggestionItemMount: () => {},
		query: '',
	};

	state = {
		lastSuggestions: null,
		suggestionPosition: 0,
	};

	refsCollection: Record< string, ReactInstance > = {};

	static getDerivedStateFromProps( props: Props, state: State ): Partial< State > | null {
		if ( isEqual( props.suggestions, state.lastSuggestions ) ) {
			return null;
		}

		return {
			lastSuggestions: props.suggestions,
			suggestionPosition: 0,
		};
	}

	getSuggestionsCount = () => this.props.suggestions.length;

	getOriginalIndexFromPosition = ( index: number ) =>
		this.getCategories().reduce( ( foundIndex, category ) => {
			if ( foundIndex !== -1 ) return foundIndex;

			const suggestion = find( category.suggestions, { index } );
			return suggestion ? suggestion.originalIndex : -1;
		}, -1 );

	suggest = ( originalIndex: number ) =>
		this.props.suggest( this.props.suggestions[ originalIndex ], originalIndex );

	moveSelectionDown = () => {
		const position = ( this.state.suggestionPosition + 1 ) % this.getSuggestionsCount();
		( ReactDOM.findDOMNode(
			this.refsCollection[ 'suggestion_' + position ]
		) as HTMLButtonElement ).scrollIntoView( {
			block: 'nearest',
		} );

		this.changePosition( position );
	};

	moveSelectionUp = () => {
		const position =
			( this.state.suggestionPosition - 1 + this.getSuggestionsCount() ) %
			this.getSuggestionsCount();
		( ReactDOM.findDOMNode(
			this.refsCollection[ 'suggestion_' + position ]
		) as HTMLButtonElement ).scrollIntoView( {
			block: 'nearest',
		} );

		this.changePosition( position );
	};

	changePosition = position =>
		this.setState( {
			suggestionPosition: position,
		} );

	handleKeyEvent = event => {
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

	handleMouseDown = originalIndex => {
		this.suggest( originalIndex );
	};

	handleMouseOver = ( suggestionPosition: number ) => this.setState( { suggestionPosition } );

	getCategories() {
		// We need to remember the original index of the suggestion according to the
		// `suggestions` prop for tracks and firing callbacks.
		const withOriginalIndex: Array< Suggestion & {
			originalIndex: number;
		} > = this.props.suggestions.map( ( suggestion, originalIndex ) => ( {
			...suggestion,
			originalIndex,
		} ) );

		const [ withCategory, withoutCategory ] = partition(
			withOriginalIndex,
			suggestion => !! suggestion.category
		);

		// For all intents and purposes `groupBy` keeps the order stable
		// https://github.com/lodash/lodash/issues/2212
		const byCategory = groupBy( withCategory, property( 'category' ) );

		const categories: Array< {
			category?: string;
			categoryKey: string;
			suggestions: Array< Suggestion & { index: number; originalIndex: number } >;
		} > = Object.entries( byCategory ).map( ( [ category, suggestions ] ) => ( {
			category,
			categoryKey: category,
			suggestions,
		} ) );

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

	render() {
		const { query } = this.props;
		const showSuggestions = this.getSuggestionsCount() > 0;

		return (
			<div>
				{ showSuggestions && (
					<div className="suggestions__wrapper">
						{ this.getCategories().map(
							( { category, categoryKey, suggestions }, categoryIndex ) => (
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
												this.props.onSuggestionItemMount( {
													suggestionIndex: originalIndex,
													index,
												} )
											}
											onMouseDown={ () => this.handleMouseDown( originalIndex ) }
											onMouseOver={ () => this.handleMouseOver( index ) }
											label={ label }
											ref={ suggestion => {
												this.refsCollection[ 'suggestion_' + index ] = suggestion;
											} }
										/>
									) ) }
								</React.Fragment>
							)
						) }
					</div>
				) }
			</div>
		);
	}
}

export default Suggestions;
