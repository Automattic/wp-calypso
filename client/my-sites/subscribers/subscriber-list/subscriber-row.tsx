import { Gridicon } from '@automattic/components';
import moment from 'moment';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { Subscriber } from '../types';
import { SubscriberProfile } from './subscriber-profile';

type SubscriberRowProps = Subscriber & {
	locale: string;
};

export const SubscriberRow = ( {
	display_name,
	email_address,
	subscriptions,
	openRate,
	date_subscribed,
	avatar,
	locale,
}: SubscriberRowProps ) => {
	return (
		<li className="subscriber-row row" role="row">
			<div className="subscriber-list__checkbox-column hidden" role="cell">
				<FormCheckbox />
			</div>
			<span className="subscriber-list__profile-column" role="cell">
				<SubscriberProfile avatar={ avatar } displayName={ display_name } email={ email_address } />
			</span>
			<span className="subscriber-list__subscription-type-column hidden" role="cell">
				{ subscriptions && subscriptions.map( ( subscription ) => <div>{ subscription }</div> ) }
			</span>
			<span className="subscriber-list__rate-column hidden" role="cell">
				{ openRate }
			</span>
			<span className="subscriber-list__since-column" role="cell">
				{ moment( date_subscribed ).locale( locale ).format( 'LL' ) }
			</span>
			<span className="subscriber-list__menu-column" role="cell">
				<Gridicon icon="ellipsis" size={ 24 } />
			</span>
		</li>
	);
};
