/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Search from 'components/search';
import Suggestions from './suggestions';

class SearchAutocomplete extends Component {
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
		ignored: PropTypes.array,
	}

	static defaultProps = {
		ignored: [],
	}

	state = {
		search: '',
		searchIsOpen: false,
	}

	handleSearch = ( term ) => {
		if ( this.state.search === term ) {
			return;
		}

		this.setState( () => ( {
			search: term || '',
		} ) );
	}

	registerSuggestions = ( suggestions ) => {
		this.suggestions = suggestions ? suggestions.getWrappedInstance() : null;
	}

	handleKeyDown = ( event ) => {
		this.suggestions.handleKeyEvent( event );
	}

	select = ( item ) => {
		this.refs.search.clear();
		this.props.onSelect( item );
	}

	handleSearchClose = () => {
		this.setState( () => ( {
			search: '',
			searchIsOpen: false,
		} ) );
	}

	handleSearchOpen = () => {
		this.setState( () => ( {
			searchIsOpen: true,
		} ) );
	}

	render() {
		const { ignored, translate } = this.props;

		const searchAutocompleteClass = classNames( 'search-autocomplete', {
			'has-highlight': this.state.searchIsOpen,
		} );

		return (
			<div className={ searchAutocompleteClass }>
				<Card className="search-autocomplete__card">
					{ this.props.children }

					<Search
						pinned
						fitsContainer
						delaySearch
						ref="search"
						onSearch={ this.handleSearch }
						onSearchOpen={ this.handleSearchOpen }
						onSearchClose={ this.handleSearchClose }
						onKeyDown={ this.handleKeyDown }
						placeholder={ translate( 'Search for content' ) } />
					<Suggestions
						ref={ this.registerSuggestions }
						searchTerm={ this.state.search }
						ignored={ ignored }
						suggest={ this.select } />
				</Card>
			</div>
		);
	}
}

export default localize( SearchAutocomplete );
