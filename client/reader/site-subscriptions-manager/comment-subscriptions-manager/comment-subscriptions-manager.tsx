import { useTranslate } from 'i18n-calypso';
import { Comments } from 'calypso/landing/subscriptions/components/tab-views';
import SubscriptionsManagerWrapper from '../subscriptions-manager-wrapper';

const CommentSubscriptionsManager = () => {
	const translate = useTranslate();

	return (
		<SubscriptionsManagerWrapper
			headerText={ translate( 'Manage subscribed posts' ) }
			subHeaderText={ translate( 'Manage your site, RSS, and newsletter subscriptions.' ) }
		>
			<Comments />
		</SubscriptionsManagerWrapper>
	);
};

export default CommentSubscriptionsManager;
