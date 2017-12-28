/** @format */
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
import SearchCard from 'client/components/search-card';

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
