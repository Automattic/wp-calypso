/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import connectSite from 'lib/reader-connect-site';
import userSettings from 'lib/user-settings';
import SubscriptionListItem from 'blocks/reader-subscription-list-item';
import { isFollowing as isFollowingSelector } from 'state/selectors';

class ConnectedSubscriptionListItem extends React.Component {
	static propTypes = {
		feed: PropTypes.object,
		site: PropTypes.object,
		translate: PropTypes.func,
		feedId: PropTypes.number,
		siteId: PropTypes.number,
		onLoad: PropTypes.func,
		showEmailSettings: PropTypes.bool,
		showLastUpdatedDate: PropTypes.bool,
		isFollowing: PropTypes.bool,
		followSource: PropTypes.string,
	};

	static defaultProps = {
		onLoad: noop,
		showEmailSettings: true,
		showLastUpdatedDate: true,
	};

	componentDidMount() {
		this.props.onLoad();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props !== prevProps ) {
			this.props.onLoad();
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
			showEmailSettings,
			showLastUpdatedDate,
			isFollowing,
			followSource,
		} = this.props;
		const isEmailBlocked = userSettings.getSetting( 'subscription_delivery_email_blocked' );

		return (
			<SubscriptionListItem
				translate={ translate }
				feedId={ feedId }
				siteId={ siteId }
				site={ site }
				feed={ feed }
				url={ url }
				showEmailSettings={ showEmailSettings && ! isEmailBlocked }
				showLastUpdatedDate={ showLastUpdatedDate }
				isFollowing={ isFollowing }
				followSource={ followSource }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	isFollowing: isFollowingSelector( state, { feedId: ownProps.feedId, blogId: ownProps.siteId } ),
} ) )( localize( connectSite( ConnectedSubscriptionListItem ) ) );
