import { useTranslate, translate } from 'i18n-calypso';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { Subscriber } from '../../types';
import { SubscriberRow } from './subscriber-row';
import accept from 'calypso/lib/accept';
import './styles.scss';

type SubscriberListProps = {
	subscribers: Subscriber[];
};

const noop = () => undefined;

const unsubscribe = ( subscriber: Subscriber ) => {
	const subscriberHasPlans = !! subscriber?.plans?.length;
	const confirmButtonLabel = subscriberHasPlans
		? translate( 'Manage', { context: 'Navigate to the Earns page button text.' } )
		: translate( 'Unsubscribe', { context: 'Confirm Unsubscribe subscriber button text.' } );

	const confirmMessage = subscriberHasPlans
		? translate(
				'Looks like you’re trying to remove a paid subscriber %s. You’ll need to remove their paid subscription to continue.',
				{ args: [ subscriber.display_name ], comment: "%s is the subscriber's public display name" }
		  )
		: translate(
				'Are you sure you want to remove %s from your subscribers? They will no longer receive any notifications from your site.',
				{ args: [ subscriber.display_name ], comment: "%s is the subscriber's public display name" }
		  );

	accept(
		<div>
			<p>{ confirmMessage }</p>
		</div>,
		( accepted: boolean ) => {
			if ( accepted ) {
				// todo: run mutation that removes the subscriber depedning on if they have plans or not. If they are a paid subscriber, navigate to the Earns page.
				// todo: maybe track the action
			} else {
				// todo: maybe track the action
			}
		},
		confirmButtonLabel
	);
};

export const SubscriberList = ( { subscribers }: SubscriberListProps ) => {
	const translate = useTranslate();
	return (
		<ul className="subscriber-list" role="table">
			<li className="row header" role="row">
				<span className="subscriber-list__checkbox-column hidden" role="columnheader">
					<FormCheckbox />
				</span>
				<span className="subscriber-list__profile-column" role="columnheader">
					{ translate( 'Name' ) }
				</span>
				<span className="subscriber-list__subscription-type-column hidden" role="columnheader">
					{ translate( 'Subscription type' ) }
				</span>
				<span className="subscriber-list__rate-column hidden" role="columnheader">
					{ translate( 'Open Rate' ) }
				</span>
				<span className="subscriber-list__since-column" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				<span className="subscriber-list__menu-column" role="columnheader"></span>
			</li>
			{ subscribers.map( ( subscriber ) => (
				<SubscriberRow
					key={ subscriber.subscription_id }
					subscriber={ subscriber }
					onView={ noop }
					onUnsubscribe={ () => unsubscribe( subscriber ) }
				/>
			) ) }
		</ul>
	);
};
