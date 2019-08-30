/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { find, groupBy, isEqual, property } from 'lodash';

/**
 * Internal dependencies
 */
import Item from './item';

/**
 * Style depenedencies
 */
import './style.scss';

class Suggestions extends Component {
	static propTypes = {
		query: PropTypes.string,
		suggestions: PropTypes.arrayOf(
			PropTypes.shape( {
				label: PropTypes.string,
			} )
		).isRequired,
		suggest: PropTypes.func.isRequired,
		railcar: PropTypes.object,
	};

	static defaultProps = {
		query: '',
	};

	state = {
		suggestionPosition: 0,
	};

	refsCollection = {};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( isEqual( nextProps.suggestions, this.props.suggestions ) ) {
			return;
		}

		this.setState( { suggestionPosition: 0 } );
	}

	getSuggestionsCount = () => this.props.suggestions.length;

	getOriginalIndexFromPosition = index =>
		this.getCategories().reduce( ( foundIndex, category ) => {
			if ( foundIndex !== -1 ) return foundIndex;

			const suggestion = find( category.suggestions, { index } );
			return suggestion ? suggestion.originalIndex : -1;
		}, -1 );

	suggest = originalIndex => this.props.suggest( this.props.suggestions[ originalIndex ] );

	moveSelectionDown = () => {
		const position = ( this.state.suggestionPosition + 1 ) % this.getSuggestionsCount();
		ReactDOM.findDOMNode( this.refsCollection[ 'suggestion_' + position ] ).scrollIntoView( {
			block: 'nearest',
		} );

		this.changePosition( position );
	};

	moveSelectionUp = () => {
		const position =
			( this.state.suggestionPosition - 1 + this.getSuggestionsCount() ) %
			this.getSuggestionsCount();
		ReactDOM.findDOMNode( this.refsCollection[ 'suggestion_' + position ] ).scrollIntoView( {
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

	handleMouseDown = originalIndex => this.suggest( originalIndex );

	handleMouseOver = suggestionPosition => this.setState( { suggestionPosition } );

	getCategories() {
		// We need to remember the original index of the suggestion according to the
		// `suggestions` prop for tracks and firing callbacks.
		const withOriginalIndex = this.props.suggestions.map( ( suggestion, originalIndex ) => ( {
			...suggestion,
			originalIndex,
		} ) );

		// For all intents and purposes `groupBy` keeps the order stable
		// https://github.com/lodash/lodash/issues/2212
		const byCategory = groupBy( withOriginalIndex, property( 'category' ) );

		const categories = Object.entries( byCategory ).map( ( [ category, suggestions ] ) => ( {
			category,
			suggestions,
		} ) );

		let order = 0;
		for ( const category of categories ) {
			for ( const suggestion of category.suggestions ) {
				suggestion.index = order++;
			}
		}

		return categories;
	}

	render() {
		const { query, railcar } = this.props;
		const showSuggestions = this.getSuggestionsCount() > 0;

		return (
			<div>
				{ showSuggestions && (
					<div className="suggestions__wrapper">
						{ this.getCategories().map( ( { category, suggestions }, categoryIndex ) => (
							<>
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
										onMouseDown={ () => this.handleMouseDown( originalIndex ) }
										onMouseOver={ () => this.handleMouseOver( index ) }
										label={ label }
										railcar={
											railcar && {
												...railcar,
												railcar: `${ railcar.id }-${ originalIndex }`,
												fetch_position: originalIndex,
											}
										}
										ref={ suggestion => {
											this.refsCollection[ 'suggestion_' + index ] = suggestion;
										} }
									/>
								) ) }
							</>
						) ) }
					</div>
				) }
			</div>
		);
	}
}

export default Suggestions;
