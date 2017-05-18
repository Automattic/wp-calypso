/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal Dependencies
 */
import connectSite from 'lib/reader-connect-site';
import userSettings from 'lib/user-settings';
import SubscriptionListItem from 'blocks/reader-subscription-list-item';

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
			/>
		);
	}
}

export default localize( connectSite( ConnectedSubscriptionListItem ) );
