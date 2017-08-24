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

		this.setState( {
			search: term || '',
		} );
	}

	registerSuggestions = ( suggestions ) => {
		this.suggestions = suggestions ? suggestions.getWrappedInstance() : null;
	}

	handleSearchClose = () => this.setState( { search: '', searchIsOpen: false } );

	handleSearchOpen = () => this.setState( { searchIsOpen: true } );

	handleKeyDown = event => this.suggestions.handleKeyEvent( event );

	handleSelect = ( item ) => {
		this.refs.search.clear();
		this.props.onSelect( item );
	}

	render() {
		const { ignored, translate } = this.props;

		const searchAutocompleteClass = classNames( 'zoninator__search-autocomplete', {
			'has-highlight': this.state.searchIsOpen,
		} );
		const cardClass = 'zoninator__search-autocomplete__card';

		return (
			<div className={ searchAutocompleteClass }>
				<Card className={ cardClass }>
					{ this.props.children }

					<Search
						pinned
						fitsContainer
						delaySearch
						disableAutocorrect
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
						suggest={ this.handleSelect } />
				</Card>
			</div>
		);
	}
}

export default localize( SearchAutocomplete );
