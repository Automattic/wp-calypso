import { FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { Icon, people, currencyDollar, atSymbol } from '@wordpress/icons';
import { ChangeEvent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { useSubscriberImportMutation } from 'calypso/data/paid-newsletter/use-subscriber-import-mutation';

type Props = {
	cardData: any;
	status: string;
	proStatus: string;
	siteId: number;
};
export default function SubscriberSummary( { status, proStatus, cardData, siteId }: Props ) {
	const paidSubscribers = cardData?.meta?.paid_subscribers_count ?? 0;
	const hasPaidSubscribers = proStatus !== 'skipped' && parseInt( paidSubscribers ) > 0;
	const [ isDisabled, setIsDisabled ] = useState( ! hasPaidSubscribers );

	const { enqueueSubscriberImport } = useSubscriberImportMutation();

	const importSubscribers = () => {
		enqueueSubscriberImport( siteId, 'substack', 'summary' );
	};

	const onChange = ( { target: { checked } }: ChangeEvent< HTMLInputElement > ) =>
		setIsDisabled( checked );

	if ( status === 'skipped' ) {
		return (
			<div className="summary__content">
				<p>
					<Icon icon={ atSymbol } /> Subscriber importing was <strong>skipped!</strong>
				</p>
			</div>
		);
	}

	if ( status === 'pending' ) {
		return (
			<div className="summary__content">
				<p>Here's an overview of what you'll migrate:</p>
				<p>
					<Icon icon={ people } />
					<strong>{ cardData?.meta?.email_count }</strong> subscribers
				</p>
				{ hasPaidSubscribers && (
					<p>
						<Icon icon={ currencyDollar } />
						<strong>{ cardData?.meta?.paid_subscribers_count }</strong> paid subscribers
					</p>
				) }
				{ hasPaidSubscribers && (
					<>
						<p>
							<strong>Before we import your newsletter</strong>
						</p>

						<p>
							<strong>To prevent any unexpected actions by your old provider</strong>, go to your
							Stripe dashboard and click “Revoke access” for any service previously associated with
							this subscription.
						</p>

						<p>
							<FormLabel>
								<FormCheckbox
									checked={ isDisabled }
									defaultChecked={ false }
									onChange={ onChange }
								/>
								I’ve disconnected other providers from the Stripe account
							</FormLabel>
						</p>
					</>
				) }
				<Button variant="primary" disabled={ ! isDisabled } onClick={ importSubscribers }>
					Import subscribers
				</Button>
			</div>
		);
	}

	if ( status === 'importing' ) {
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
