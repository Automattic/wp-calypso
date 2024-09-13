import { Icon, people, currencyDollar, atSymbol } from '@wordpress/icons';

type Props = {
	cardData: any;
	status: string;
};

export default function SubscriberSummary( { cardData, status }: Props ) {
	const paidSubscribers = cardData?.meta?.paid_subscribers_count ?? 0;
	const hasPaidSubscribers = parseInt( paidSubscribers ) > 0;

	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ atSymbol } /> Subscriber importing was <strong>skipped</strong>
				</p>
			</div>
		);
	}

	if ( status === 'importing' || status === 'pending' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ people } /> Importing subscribers...
				</p>
			</div>
		);
	}

	if ( status === 'done' ) {
		const paid_subscribers = cardData?.meta?.paid_subscribers_count ?? 0;
		const free_subscribers = cardData?.meta?.subscribed_count - paid_subscribers;

		return (
			<div className="summary__content">
				<p>We migrated { cardData.meta.subscribed_count } subscribers</p>
				<p>
					<Icon icon={ people } />
					<strong>{ free_subscribers }</strong> free subscribers
				</p>
				{ hasPaidSubscribers && (
					<p>
						<Icon icon={ currencyDollar } />
						<strong>{ cardData.meta.paid_subscribers_count }</strong> paid subscribers
					</p>
				) }
			</div>
		);
	}
}
