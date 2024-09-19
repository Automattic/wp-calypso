import { useTranslate } from 'i18n-calypso';
import { Pending } from 'calypso/landing/subscriptions/components/tab-views';
import SubscriptionsManagerWrapper from '../subscriptions-manager-wrapper';

const PendingSubscriptionsManager = () => {
	const translate = useTranslate();

	return (
		<>
			<div>
				<div>
					<SubscriptionsManagerWrapper
						headerText={ translate( 'Manage pending subscriptions' ) }
						subHeaderText={ translate( 'Manage your site, RSS, and newsletter subscriptions.' ) }
					>
						<Pending />
					</SubscriptionsManagerWrapper>
				</div>
			</div>
		</>
	);
};

export default PendingSubscriptionsManager;
