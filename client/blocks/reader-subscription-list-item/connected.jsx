/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import connectSite from 'lib/reader-connect-site';
import SubscriptionListItem from 'blocks/reader-subscription-list-item';
import getUserSetting from 'state/selectors/get-user-setting';
import isFollowingSelector from 'state/selectors/is-following';
import QueryUserSettings from 'components/data/query-user-settings';

class ConnectedSubscriptionListItem extends React.Component {
	static propTypes = {
		feed: PropTypes.object,
		site: PropTypes.object,
		translate: PropTypes.func,
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
			translate,
			url,
			feedId,
			siteId,
			showNotificationSettings,
			showLastUpdatedDate,
			isEmailBlocked,
			isFollowing,
			followSource,
			railcar,
		} = this.props;

		return (
			<div>
				<QueryUserSettings />
				<SubscriptionListItem
					translate={ translate }
					feedId={ feedId }
					siteId={ siteId }
					site={ site }
					feed={ feed }
					url={ url }
					showNotificationSettings={ showNotificationSettings && ! isEmailBlocked }
					showLastUpdatedDate={ showLastUpdatedDate }
					isFollowing={ isFollowing }
					followSource={ followSource }
					railcar={ railcar }
				/>
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	isEmailBlocked: getUserSetting( state, 'subscription_delivery_email_blocked' ),
	isFollowing: isFollowingSelector( state, { feedId: ownProps.feedId, blogId: ownProps.siteId } ),
} ) )( localize( connectSite( ConnectedSubscriptionListItem ) ) );
