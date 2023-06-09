import { Gridicon } from '@automattic/components';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import TimeSince from 'calypso/components/time-since';
import { Subscriber } from '../types';
import { SubscriberProfile } from './subscriber-profile';

export const SubscriberRow = ( {
	display_name,
	email_address,
	openRate,
	date_subscribed,
	avatar,
}: Subscriber ) => {
	return (
		<li className="subscriber-row row" role="row">
			<div className="subscriber-list__checkbox-column hidden" role="cell">
				<FormCheckbox />
			</div>
			<span className="subscriber-list__profile-column" role="cell">
				<SubscriberProfile avatar={ avatar } displayName={ display_name } email={ email_address } />
			</span>
			<span className="subscriber-list__subscription-type-column hidden" role="cell"></span>
			<span className="subscriber-list__rate-column hidden" role="cell">
				{ openRate }
			</span>
			<span className="subscriber-list__since-column" role="cell">
				<TimeSince date={ date_subscribed } dateFormat="LL" />
			</span>
			<span className="subscriber-list__menu-column" role="cell">
				<Gridicon icon="ellipsis" size={ 24 } />
			</span>
		</li>
	);
};
