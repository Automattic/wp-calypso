import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import SearchCard from 'calypso/components/search-card';

const noop = () => {};

class FollowingManageSearchFollowed extends Component {
	static propTypes = {
		initialValue: PropTypes.string,
		onSearch: PropTypes.func,
	};

	static defaultProps = {
		onSearch: noop,
	};

	render() {
		const { translate } = this.props;
		return (
			<SearchCard
				compact={ true }
				pinned={ false }
				className="following-manage__search-followed"
				additionalClasses="following-manage__search-followed-input"
				placeholder={ translate( 'Search…' ) }
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
