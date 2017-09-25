/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SubscriptionListItem from 'blocks/reader-subscription-list-item';
import connectSite from 'lib/reader-connect-site';
import userSettings from 'lib/user-settings';
import { isFollowing as isFollowingSelector } from 'state/selectors';

class ConnectedSubscriptionListItem extends React.Component {
	static propTypes = {
		feed: PropTypes.object,
		site: PropTypes.object,
		translate: PropTypes.func,
		feedId: PropTypes.number,
		siteId: PropTypes.number,
		onShouldMeasure: PropTypes.func,
		onComponentMountWithNewRailcar: PropTypes.func,
		showEmailSettings: PropTypes.bool,
		showLastUpdatedDate: PropTypes.bool,
		isFollowing: PropTypes.bool,
		followSource: PropTypes.string,
		railcar: PropTypes.object,
	};

	static defaultProps = {
		onShouldMeasure: noop,
		onComponentMountWithNewRailcar: noop,
		showEmailSettings: true,
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
			showEmailSettings,
			showLastUpdatedDate,
			isFollowing,
			followSource,
			railcar,
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
				railcar={ railcar }
			/>
		);
	}
}

export default connect( ( state, ownProps ) => ( {
	isFollowing: isFollowingSelector( state, { feedId: ownProps.feedId, blogId: ownProps.siteId } ),
} ) )( localize( connectSite( ConnectedSubscriptionListItem ) ) );
