import { Component } from 'react';
import ReaderSubscriptionListItemPlaceholder from 'calypso/blocks/reader-subscription-list-item/placeholder';

class FollowingManageSubscriptionsPlaceholder extends Component {
	render() {
		return (
			<div className="following-manage__subscriptions-placeholder">
				{ Array( 3 )
					.fill( null )
					.map( () => (
						<ReaderSubscriptionListItemPlaceholder />
					) ) }
			</div>
		);
	}
}

export default FollowingManageSubscriptionsPlaceholder;
