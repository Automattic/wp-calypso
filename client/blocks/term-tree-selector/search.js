/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Gridicon from 'gridicons';

export default React.createClass( {
	displayName: 'TermTreeSelectorSearch',

	propTypes: {
		searchTerm: PropTypes.string,
		onSearch: PropTypes.func.isRequired
	},

	render() {
		return (
			<div className="term-tree-selector__search">
				<Gridicon icon="search" size={ 18 } />
				<input type="search"
					placeholder={ this.translate( 'Search…', { textOnly: true } ) }
					value={ this.props.searchTerm }
					onChange={ this.props.onSearch } />
			</div>
		);
	}
} );
