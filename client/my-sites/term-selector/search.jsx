/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'TermSelectorSearch',

	propTypes: {
		searchTerm: PropTypes.string,
		onSearch: PropTypes.func.isRequired
	},

	render() {
		return (
			<div className="term-selector__search">
				<Gridicon icon="search" size={ 18 } />
				<input type="search"
					placeholder={ this.translate( 'Search…', { textOnly: true } ) }
					value={ this.props.searchTerm }
					onChange={ this.props.onSearch } />
			</div>
		);
	}
} );
