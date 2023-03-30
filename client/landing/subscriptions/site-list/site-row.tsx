import { NotificationSettings } from '../notification-settings';
import type { SiteSubscription } from '@automattic/data-stores/src/reader/types';

export default function SiteRow( {
	ID,
	name,
	site_icon,
	URL,
	date_subscribed,
	delivery_methods,
}: SiteSubscription ) {
	const since = new Date( date_subscribed ).toDateString();
	const deliveryFrequency = delivery_methods?.email?.post_delivery_frequency;

	return (
		<li className="row" role="row" key={ ID }>
			<span className="title-box" role="cell">
				<img className="icon" src={ site_icon } alt={ name } />
				<span className="title-column">
					<span className="name">{ name }</span>
					<span className="url">{ URL }</span>
				</span>
			</span>
			<span className="date" role="cell">
				{ since }
			</span>
			<span className="email-frequency" role="cell">
				{ deliveryFrequency }
			</span>
			<span className="actions" role="cell">
				<NotificationSettings />
			</span>
		</li>
	);
}
