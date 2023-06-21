import FormCheckbox from 'calypso/components/forms/form-checkbox';
import TimeSince from 'calypso/components/time-since';
import useSubscriptionPlans from '../../hooks/use-subscription-plans';
import { Subscriber } from '../../types';
import { SubscriberPopover } from '../subscriber-popover';
import { SubscriberProfile } from '../subscriber-profile';

type SubscriberRowProps = {
	onUnsubscribe: ( subscriber: Subscriber ) => void;
	onView: ( subscriber: Subscriber ) => void;
	subscriber: Subscriber;
};

export const SubscriberRow = ( { subscriber, onView, onUnsubscribe }: SubscriberRowProps ) => {
	const { avatar, display_name, email_address, date_subscribed, open_rate } = subscriber;
	const subscriptionPlans = useSubscriptionPlans( subscriber );

	return (
		<li className="subscriber-row row" role="row">
			<div className="subscriber-list__checkbox-column hidden" role="cell">
				<FormCheckbox />
			</div>
			<span className="subscriber-list__profile-column" role="cell">
				<SubscriberProfile avatar={ avatar } displayName={ display_name } email={ email_address } />
			</span>
			<span className="subscriber-list__subscription-type-column" role="cell">
				{ subscriptionPlans &&
					subscriptionPlans.map( ( subscriptionPlan, index ) => (
						<div key={ index }>{ subscriptionPlan }</div>
					) ) }
			</span>
			<span className="subscriber-list__rate-column hidden" role="cell">
				{ open_rate }
			</span>
			<span className="subscriber-list__since-column" role="cell">
				<TimeSince date={ date_subscribed } dateFormat="LL" />
			</span>
			<span className="subscriber-list__menu-column" role="cell">
				<SubscriberPopover
					onView={ () => onView( subscriber ) }
					onUnsubscribe={ () => onUnsubscribe( subscriber ) }
				/>
			</span>
		</li>
	);
};
