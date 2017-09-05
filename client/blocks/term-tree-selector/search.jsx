/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

export default localize( React.createClass( {
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
					placeholder={ this.props.translate( 'Search…', { textOnly: true } ) }
					value={ this.props.searchTerm }
					onChange={ this.props.onSearch } />
			</div>
		);
	}
} ) );
