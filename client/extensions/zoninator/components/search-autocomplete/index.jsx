/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PostSuggestions from './post-suggestions';
import Card from 'components/card';
import Search from 'components/search';

class SearchAutocomplete extends Component {
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
		exclude: PropTypes.array,
	}

	static defaultProps = {
		exclude: [],
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

	setSearch = ref => this.searchRef = ref;

	setSuggestions = ref => this.suggestionsRef = ref && ref.getWrappedInstance();

	handleSearchClose = () => this.setState( { search: '', searchIsOpen: false } );

	handleSearchOpen = () => this.setState( { searchIsOpen: true } );

	handleKeyDown = event => this.suggestionsRef && this.suggestionsRef.handleKeyEvent( event );

	handleSelect = ( item ) => {
		this.searchRef.clear();
		this.props.onSelect( item );
	}

	render() {
		const { exclude, translate } = this.props;

		const searchAutocompleteClass = classNames( 'zoninator__search-autocomplete', {
			'has-highlight': this.state.searchIsOpen,
		} );
		const cardClass = 'zoninator__search-autocomplete-card';

		return (
			<div className={ searchAutocompleteClass }>
				<Card className={ cardClass }>
					{ this.props.children }

					<Search
						pinned
						fitsContainer
						delaySearch
						disableAutocorrect
						ref={ this.setSearch }
						onSearch={ this.handleSearch }
						onSearchOpen={ this.handleSearchOpen }
						onSearchClose={ this.handleSearchClose }
						onKeyDown={ this.handleKeyDown }
						placeholder={ translate( 'Search for content' ) } />
					{
						this.state.search &&
						<PostSuggestions
							ref={ this.setSuggestions }
							search={ this.state.search }
							exclude={ exclude }
							suggest={ this.handleSelect } />
					}
				</Card>
			</div>
		);
	}
}

export default localize( SearchAutocomplete );
