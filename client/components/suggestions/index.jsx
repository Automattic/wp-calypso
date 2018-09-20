/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findIndex, isEqual, map } from 'lodash';

/**
 * Internal dependencies
 */
import Item from './item';

class Suggestions extends Component {
	static propTypes = {
		query: PropTypes.string,
		suggestions: PropTypes.arrayOf(
			PropTypes.shape( {
				label: PropTypes.string,
			} )
		).isRequired,
		suggest: PropTypes.func.isRequired,
	};

	static defaultProps = {
		query: '',
	};

	state = {
		suggestionPosition: 0,
	};

	componentWillReceiveProps( nextProps ) {
		if ( isEqual( nextProps.suggestions, this.props.suggestions ) ) {
			return;
		}

		this.setState( { suggestionPosition: 0 } );
	}

	getSuggestionsCount = () => this.props.suggestions.length;

	getPositionForSuggestion = label => findIndex( this.props.suggestions, { label } );

	suggest = position => this.props.suggest( this.props.suggestions[ position ] );

	increasePosition = () =>
		this.setState( {
			suggestionPosition: ( this.state.suggestionPosition + 1 ) % this.getSuggestionsCount(),
		} );

	decreasePosition = () =>
		this.setState( {
			suggestionPosition:
				( this.getSuggestionsCount() + this.state.suggestionPosition - 1 ) %
				this.getSuggestionsCount(),
		} );

	handleKeyEvent = event => {
		if ( this.getSuggestionsCount() === 0 ) {
			return;
		}

		switch ( event.key ) {
			case 'ArrowDown':
				this.increasePosition();
				event.preventDefault();
				break;

			case 'ArrowUp':
				this.decreasePosition();
				event.preventDefault();
				break;

			case 'Enter':
				this.state.suggestionPosition >= 0 && this.suggest( this.state.suggestionPosition );
				break;
		}
	};

	handleMouseDown = label => this.suggest( this.getPositionForSuggestion( label ) );

	handleMouseOver = label =>
		this.setState( {
			suggestionPosition: this.getPositionForSuggestion( label ),
		} );

	render() {
		const { query } = this.props;
		const showSuggestions = this.getSuggestionsCount() > 0;

		return (
			<div>
				{ showSuggestions && (
					<div className="suggestions__wrapper">
						{ map( this.props.suggestions, ( { label }, index ) => (
							<Item
								key={ index }
								hasHighlight={ index === this.state.suggestionPosition }
								query={ query }
								onMouseDown={ this.handleMouseDown }
								onMouseOver={ this.handleMouseOver }
								label={ label }
							/>
						) ) }
					</div>
				) }
			</div>
		);
	}
}

export default Suggestions;
