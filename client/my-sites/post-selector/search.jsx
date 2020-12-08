/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import FormTextInput from 'calypso/components/forms/form-text-input';

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
				<FormTextInput
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
