import { Button } from '@automattic/components';
import { Icon, lock, currencyDollar, postDate } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import CreditCardImg from 'calypso/assets/images/jetpack/credit-cards.png';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function EmptyState() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const navigateToCreateMethod = () => {
		dispatch(
			recordTracksEvent( 'calypso_partner_portal_license_list_empty_issue_license_click' )
		);
	};

	return (
		<>
			<div className="payment-method-list-v2-empty-state__top-content">
				<img src={ CreditCardImg } alt="Credit Cards" />
				<Button
					primary
					href="/partner-portal/payment-methods/add"
					onClick={ navigateToCreateMethod }
				>
					{ translate( 'Add a card' ) }
				</Button>
			</div>
			<div className="payment-method-list-v2-empty-state__bottom-content">
				<div className="payment-method-list-v2-empty-state__card">
					<Icon icon={ lock } />
					<div className="payment-method-list-v2-empty-state__card-title">
						{ translate( 'World-class card security' ) }
					</div>
					<div className="payment-method-list-v2-empty-state__card-description">
						{ translate(
							'Stripe, our payment provider, holds PCI Service Provider Level 1 certification—the highest security standard in the industry. Rest easy knowing your card data is in good hands.'
						) }
					</div>
				</div>
				<div className="payment-method-list-v2-empty-state__card">
					<Icon icon={ currencyDollar } />
					<div className="payment-method-list-v2-empty-state__card-title">
						{ translate( 'Only pay for active licenses' ) }
					</div>
					<div className="payment-method-list-v2-empty-state__card-description">
						{ translate(
							'Jetpack Manage is free to use. Your running total is calculated daily based on how many licenses you have issued. Your card will be charged on the 1st of the following month.'
						) }
					</div>
				</div>
				<div className="payment-method-list-v2-empty-state__card">
					<Icon icon={ postDate } />
					<div className="payment-method-list-v2-empty-state__card-title">
						{ translate( 'Flexible billing in your control' ) }
					</div>
					<div className="payment-method-list-v2-empty-state__card-description">
						{ translate(
							"Our billing matches your monthly client payments, so you're not stuck with yearly fees. Cancel licenses anytime to cease billing immediately."
						) }
					</div>
				</div>
			</div>
		</>
	);
}
