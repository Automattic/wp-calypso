/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, findIndex, first, isEqual, map } from 'lodash';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import { getSitePostsForQuery } from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import SuggestionItem from './suggestion-item';

class Suggestions extends Component {

	static propTypes = {
		suggest: PropTypes.func.isRequired,
		searchTerm: PropTypes.string,
		suggestions: PropTypes.array,
		ignored: PropTypes.array,
		siteId: PropTypes.number,
	}

	static defaultProps = {
		suggestions: [],
		searchTerm: '',
	}

	state = {
		suggestions: [],
		suggestionPosition: 0,
		currentSuggestion: null,
	}

	componentWillReceiveProps( nextProps ) {
		if (
			isEqual( nextProps.suggestions, this.props.suggestions ) &&
			isEqual( nextProps.ignored, this.ignored )
		) {
			return;
		}

		const suggestions = this.filterSuggestions( nextProps.suggestions, nextProps.ignored );

		this.setState( {
			suggestions,
			suggestionPosition: 0,
			currentSuggestion: first( suggestions ),
		} );
	}

	filterSuggestions( suggestions, ignored ) {
		if ( ! suggestions ) {
			return [];
		}

		return suggestions.filter( ( { slug } ) => ! find( ignored, { slug } ) );
	}

	countSuggestions = () => this.state.suggestions.length;

	getPositionForSuggestion = slug => findIndex( this.state.suggestions, { slug: slug } );

	getSuggestionForPosition = position => this.state.suggestions[ position ];

	increasePosition() {
		const position = ( this.state.suggestionPosition + 1 ) % this.countSuggestions();
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	}

	decreasePosition() {
		const position = ( this.countSuggestions() + this.state.suggestionPosition - 1 ) % this.countSuggestions();
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	}

	handleKeyEvent = ( event ) => {
		if ( this.countSuggestions() === 0 ) {
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
				this.state.currentSuggestion && this.props.suggest( this.state.currentSuggestion );
				break;
		}
	}

	handleMouseDown = ( slug ) => {
		const position = this.getPositionForSuggestion( slug );
		this.props.suggest( this.getSuggestionForPosition( position ) );
	}

	handleMouseOver = ( slug ) => {
		const position = this.getPositionForSuggestion( slug );
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	}

	render() {
		const {
			searchTerm,
			siteId,
		} = this.props;

		if ( ! searchTerm ) {
			return null;
		}

		const showSuggestions = this.countSuggestions() > 0;
		const suggestionsClass = 'zoninator__search-autocomplete__suggestions';

		return (
			<div>
				<QueryPosts siteId={ siteId } query={ { search: searchTerm } } />

				{
					showSuggestions &&
					<div className={ suggestionsClass }>
						{ map( this.state.suggestions, ( post, idx ) => (
							<SuggestionItem
								key={ idx }
								hasHighlight={ idx === this.state.suggestionPosition }
								searchTerm={ searchTerm }
								onMouseDown={ this.handleMouseDown }
								onMouseOver={ this.handleMouseOver }
								post={ post } />
						) ) }
					</div>
				}
			</div>
		);
	}
}

const mapStateToProps = ( state, { searchTerm } ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId,
		suggestions: getSitePostsForQuery( state, siteId, { search: searchTerm } ),
	};
};

const connectComponent = connect( mapStateToProps, null, null, { withRef: true } );

export default connectComponent( Suggestions );
