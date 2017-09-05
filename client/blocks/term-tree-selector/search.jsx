/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

export default localize( class extends React.Component {
	static displayName = 'TermTreeSelectorSearch';

	static propTypes = {
		searchTerm: PropTypes.string,
		onSearch: PropTypes.func.isRequired
	};

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
} );
