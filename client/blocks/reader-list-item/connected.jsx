import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import connectSite from 'calypso/lib/reader-connect-site';
import { isFollowing as isFollowingSelector } from 'calypso/state/reader/follows/selectors';
import ReaderListItem from '.';

const noop = () => {};

class ConnectedReaderListItem extends Component {
	static propTypes = {
		feed: PropTypes.object,
		site: PropTypes.object,
		feedId: PropTypes.number,
		siteId: PropTypes.number,
		onShouldMeasure: PropTypes.func,
		onComponentMountWithNewRailcar: PropTypes.func,
		showNotificationSettings: PropTypes.bool,
		showLastUpdatedDate: PropTypes.bool,
		isEmailBlocked: PropTypes.bool,
		isFollowing: PropTypes.bool,
		followSource: PropTypes.string,
		railcar: PropTypes.object,
	};

	static defaultProps = {
		onShouldMeasure: noop,
		onComponentMountWithNewRailcar: noop,
		showNotificationSettings: true,
		showLastUpdatedDate: true,
	};

	componentDidMount() {
		if ( this.props.railcar ) {
			this.props.onComponentMountWithNewRailcar( this.props.railcar );
		}
		this.props.onShouldMeasure();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props !== prevProps ) {
			this.props.onShouldMeasure();
		}
		if ( this.props.railcar && this.props.railcar !== prevProps.railcar ) {
			this.props.onComponentMountWithNewRailcar( this.props.railcar );
		}
	}

	render() {
		const {
			feed,
			site,
			url,
			feedId,
			siteId,
			showNotificationSettings,
			showLastUpdatedDate,
			isFollowing,
			followSource,
			railcar,
		} = this.props;

		return (
			<ReaderListItem
				feedId={ feedId }
				siteId={ siteId }
				site={ site }
				feed={ feed }
				url={ url }
				showNotificationSettings={ showNotificationSettings }
				showLastUpdatedDate={ showLastUpdatedDate }
				isFollowing={ isFollowing }
				followSource={ followSource }
				railcar={ railcar }
			/>
		);
	}
}

export default compose(
	connect( ( state, ownProps ) => ( {
		isFollowing: isFollowingSelector( state, { feedId: ownProps.feedId, blogId: ownProps.siteId } ),
	} ) ),
	connectSite
)( ConnectedReaderListItem );
