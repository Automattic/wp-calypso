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
					<Icon icon={ atSymbol } /> You <strong>skipped</strong> subscriber importing.
				</p>
			</div>
		);
	}

	if ( status === 'importing' || status === 'pending' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ people } /> <strong>We're importing your subscribers.</strong>
					<br />
					This may take a few minutes. Feel free to leave this window – we'll let you know when it's
					done.
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
