/** @format */
/**
 * External Dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import SearchCard from 'components/search-card';

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
				compact={ true }
				pinned={ false }
				autoFocus={ false }
				className="following-manage__search-followed"
				additionalClasses="following-manage__search-followed-input"
				placeholder={ this.props.translate( 'Search Followed Sites…' ) }
				onSearch={ this.props.onSearch }
				initialValue={ this.props.initialValue }
				delaySearch={ true }
				delayTimeout={ 100 }
				hideOpenIcon={ true }
				disableAutocorrect={ true }
			/>
		);
	}
}

export default localize( FollowingManageSearchFollowed );
