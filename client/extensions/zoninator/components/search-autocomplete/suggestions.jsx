/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { find, findIndex } from 'lodash';

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
	}

	static defaultProps = {
		suggestions: [],
		searchTerm: '',
	}

	state = {
		suggestionPosition: 0,
		currentSuggestion: null,
	}

	countSuggestions() {
		return this.props.suggestions ? this.props.suggestions.length : 0;
	}

	filterSuggestions() {
		if ( ! this.countSuggestions() ) {
			return [];
		}

		const results = this.props.suggestions.filter( ( { slug } ) => ! find( this.props.ignored, { slug } ) );

		return results;
	}

	getSuggestionForPosition( position ) {
		return this.props.suggestions[ position ];
	}

	incPosition() {
		const position = ( this.state.suggestionPosition + 1 ) % this.countSuggestions();
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	}

	decPosition() {
		const position = this.state.suggestionPosition - 1;
		this.setState( {
			suggestionPosition: position < 0 ? this.countSuggestions() - 1 : position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	}

	handleKeyEvent = ( event ) => {
		if ( this.countSuggestions() === 0 ) {
			return false;
		}

		switch ( event.key ) {
			case 'ArrowDown':
				this.incPosition();
				event.preventDefault();
				break;

			case 'ArrowUp':
				this.decPosition();
				event.preventDefault();
				break;

			case 'Enter':
				if ( !! this.state.currentSuggestion ) {
					this.props.suggest( this.state.currentSuggestion );
					return true;
				}
				break;
		}

		return false;
	}

	handleMouseDown = ( slug ) => {
		const position = findIndex( this.props.suggestions, { slug: slug } );
		this.props.suggest( this.getSuggestionForPosition( position ) );
	}

	handleMouseOver = ( slug ) => {
		const position = findIndex( this.props.suggestions, { slug: slug } );
		this.setState( {
			suggestionPosition: position,
			currentSuggestion: this.getSuggestionForPosition( position ),
		} );
	}

	renderSuggestion = ( post, idx ) => (
		<SuggestionItem
			key={ idx }
			hasHighlight={ idx === this.state.suggestionPosition }
			onMouseDown={ this.onMouseDown }
			onMouseOver={ this.onMouseOver }
			post={ post } />
	)

	render() {
		const {
			searchTerm,
			siteId,
		} = this.props;

		if ( ! searchTerm ) {
			return null;
		}

		const showSuggestions = this.countSuggestions() > 0;

		return (
			<div>
				<QueryPosts siteId={ siteId } query={ { search: searchTerm } } />

				{
					showSuggestions &&
					<div className="search-autocomplete__suggestions">
						{ this.filterSuggestions().map( this.renderSuggestion ) }
					</div>
				}
			</div>
		);
	}
}

const mapStateToProps = ( state, { searchTerm } ) => {
	const siteId = getSelectedSiteId( state );

	return {
		siteId: siteId,
		suggestions: getSitePostsForQuery( state, siteId, { search: searchTerm } ),
	};
};

const connectComponent = connect( mapStateToProps, null, null, { withRef: true } );

export default connectComponent( Suggestions );
