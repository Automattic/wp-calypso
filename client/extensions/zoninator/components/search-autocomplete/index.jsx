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
import { Card } from '@automattic/components';
import Search from 'components/search';
import PostSuggestions from './post-suggestions';

class SearchAutocomplete extends Component {
	static propTypes = {
		onSelect: PropTypes.func.isRequired,
		exclude: PropTypes.array,
	};

	static defaultProps = {
		exclude: [],
	};

	state = {
		search: '',
		searchIsOpen: false,
	};

	handleSearch = ( term ) => {
		if ( this.state.search === term ) {
			return;
		}

		this.setState( {
			search: term || '',
		} );
	};

	searchRef = React.createRef();

	suggestionsRef = React.createRef();

	handleSearchClose = () => this.setState( { search: '', searchIsOpen: false } );

	handleSearchOpen = () => this.setState( { searchIsOpen: true } );

	handleKeyDown = ( event ) => {
		if ( event.key === 'Enter' ) {
			event.preventDefault();
		}

		this.suggestionsRef.current && this.suggestionsRef.current.handleKeyEvent( event );
	};

	handleSelect = ( item ) => {
		this.searchRef.current.clear();
		this.props.onSelect( item );
	};

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
						ref={ this.searchRef }
						onSearch={ this.handleSearch }
						onSearchOpen={ this.handleSearchOpen }
						onSearchClose={ this.handleSearchClose }
						onKeyDown={ this.handleKeyDown }
						placeholder={ translate( 'Search for content' ) }
					/>
					{ this.state.search && (
						<PostSuggestions
							ref={ this.suggestionsRef }
							search={ this.state.search }
							exclude={ exclude }
							suggest={ this.handleSelect }
						/>
					) }
				</Card>
			</div>
		);
	}
}

export default localize( SearchAutocomplete );
