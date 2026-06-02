import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import connectSite from 'calypso/lib/reader-connect-site';
import { useIsSubscribed } from 'calypso/reader/data/site-subscriptions';
import ReaderSubscriptionListItem from '.';

const noop = () => {};

class ConnectedSubscriptionListItem extends Component {
	static propTypes = {
		feed: PropTypes.object,
		site: PropTypes.object,
		feedId: PropTypes.number,
		siteId: PropTypes.number,
		onShouldMeasure: PropTypes.func,
		onComponentMountWithNewRailcar: PropTypes.func,
		showNotificationSettings: PropTypes.bool,
		showLastUpdatedDate: PropTypes.bool,
		showFollowedOnDate: PropTypes.bool,
		isEmailBlocked: PropTypes.bool,
		isFollowing: PropTypes.bool,
		followSource: PropTypes.string,
		railcar: PropTypes.object,
		disableSuggestedFollows: PropTypes.bool,
		onItemClick: PropTypes.func,
		isSelected: PropTypes.bool,
		url: PropTypes.string,
	};

	static defaultProps = {
		onShouldMeasure: noop,
		onComponentMountWithNewRailcar: noop,
		showNotificationSettings: true,
		showLastUpdatedDate: true,
		showFollowedOnDate: true,
		disableSuggestedFollows: false,
		onItemClick: () => {},
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
			showFollowedOnDate,
			isFollowing,
			followSource,
			railcar,
			disableSuggestedFollows,
			onItemClick,
			isSelected,
			onFollowToggle,
			replaceStreamClickWithItemClick,
		} = this.props;

		return (
			<ReaderSubscriptionListItem
				feedId={ feedId }
				siteId={ siteId }
				site={ site }
				feed={ feed }
				url={ url }
				showNotificationSettings={ showNotificationSettings }
				showLastUpdatedDate={ showLastUpdatedDate }
				showFollowedOnDate={ showFollowedOnDate }
				isFollowing={ isFollowing }
				followSource={ followSource }
				railcar={ railcar }
				disableSuggestedFollows={ disableSuggestedFollows }
				replaceStreamClickWithItemClick={ replaceStreamClickWithItemClick }
				onItemClick={ onItemClick }
				isSelected={ isSelected }
				onFollowToggle={ onFollowToggle }
			/>
		);
	}
}

const normalizeUrl = ( url ) => {
	if ( ! url ) {
		return '';
	}
	return url.match( /^https?:\/\// ) ? url : `http://${ url }`;
};

const ConnectedWithSite = compose(
	connect( ( _state, ownProps ) => ( {
		url: normalizeUrl( ownProps.url ?? '' ),
	} ) ),
	connectSite
)( ConnectedSubscriptionListItem );

export default function SubscriptionListItemContainer( props ) {
	const isFollowing = useIsSubscribed( {
		feedId: props.feedId ?? null,
		blogId: props.siteId ?? null,
	} );

	return <ConnectedWithSite { ...props } isFollowing={ isFollowing } />;
}
