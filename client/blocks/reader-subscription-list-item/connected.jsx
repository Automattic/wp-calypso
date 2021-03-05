/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { flowRight as compose, noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import connectSite from 'calypso/lib/reader-connect-site';
import SubscriptionListItem from '.';
import { isFollowing as isFollowingSelector } from 'calypso/state/reader/follows/selectors';

class ConnectedSubscriptionListItem extends React.Component {
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
			<SubscriptionListItem
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
)( ConnectedSubscriptionListItem );
