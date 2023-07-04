import { useTranslate } from 'i18n-calypso';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { useSubscribersPage } from 'calypso/my-sites/subscribers/components/subscribers-page/subscribers-page-context';
import { Subscriber } from '../../types';
import { SubscriberRow } from './subscriber-row';
import './style.scss';

type SubscriberListProps = {
	onView: ( subscriber: Subscriber ) => void;
	onUnsubscribe: ( subscriber: Subscriber ) => void;
};

const SubscriberList = ( { onView, onUnsubscribe }: SubscriberListProps ) => {
	const translate = useTranslate();
	const { subscribers } = useSubscribersPage();

	return (
		<ul className="subscriber-list" role="table">
			<li className="row header" role="row">
				<span className="subscriber-list__checkbox-column hidden" role="columnheader">
					<FormCheckbox />
				</span>
				<span className="subscriber-list__profile-column" role="columnheader">
					{ translate( 'Name' ) }
				</span>
				<span className="subscriber-list__subscription-type-column" role="columnheader">
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
					onView={ onView }
					onUnsubscribe={ onUnsubscribe }
				/>
			) ) }
		</ul>
	);
};

export default SubscriberList;
