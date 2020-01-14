/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { Gridicon } from '@automattic/components';

class PostSelectorSearch extends React.Component {
	static displayName = 'PostSelectorSearch';

	static propTypes = {
		searchTerm: PropTypes.string,
		onSearch: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div className="post-selector__search">
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

export default localize( PostSelectorSearch );
