/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import SearchCard from 'calypso/components/search-card';

class FollowingManageSearchFollowed extends Component {
	static propTypes = {
		initialValue: PropTypes.string,
		onSearch: PropTypes.func,
	};

	static defaultProps = {
		onSearch: noop,
	};

	render() {
		return (
			<SearchCard
				compact
				pinned={ false }
				className="following-manage__search-followed"
				additionalClasses="following-manage__search-followed-input"
				placeholder={ this.props.translate( 'Search followed sites…' ) }
				onSearch={ this.props.onSearch }
				initialValue={ this.props.initialValue }
				delaySearch
				delayTimeout={ 100 }
				hideOpenIcon
				disableAutocorrect
			/>
		);
	}
}

export default localize( FollowingManageSearchFollowed );
