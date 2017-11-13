/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'gridicons';

class TermTreeSelectorSearch extends React.Component {
	static displayName = 'TermTreeSelectorSearch';

	static propTypes = {
		searchTerm: PropTypes.string,
		onSearch: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div className="term-tree-selector__search">
				<Gridicon icon="search" size={ 18 } />
				<input
					type="search"
					placeholder={ this.props.translate( 'Search…', { textOnly: true } ) }
					value={ this.props.searchTerm }
					onChange={ this.props.onSearch }
				/>
			</div>
		);
	}
}

export default localize( TermTreeSelectorSearch );
