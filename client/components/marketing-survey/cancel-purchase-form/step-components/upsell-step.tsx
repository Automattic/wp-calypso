import { recordTracksEvent } from '@automattic/calypso-analytics';
import { getCurrencyDefaults } from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import rocketImage from 'calypso/assets/images/customer-home/illustration--rocket.svg';
import pluginsThemesImage from 'calypso/assets/images/customer-home/illustration--task-connect-social-accounts.svg';
import downgradeImage from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import BusinessATStep from './business-at-step';
import DowngradeStep from './downgrade-step';
import FreeMonthOfferStep from './free-month-offer-step';
import UpgradeATStep from './upgrade-at-step';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';

type UpsellProps = {
	href?: string;
	buttonText: string;
	disabled: boolean;
	onClick?: () => void;
	onDismiss?: () => void;
	children: React.ReactChild;
	image: string;
};

function Upsell( { buttonText, children, image, onDismiss, ...buttonProps }: UpsellProps ) {
	const translate = useTranslate();

	return (
		<div className="cancel-purchase-form__upsell">
			<img className="cancel-purchase-form__upsell-image" src={ image } alt="" />
			<div className="cancel-purchase-form__upsell-description">
				{ children }
				<Button { ...buttonProps } isPrimary>
					{ buttonText }
				</Button>
				<Button onClick={ onDismiss }>{ translate( 'Dismiss' ) }</Button>
			</div>
		</div>
	);
}

type StepProps = {
	upsell: string;
	purchase: Purchase;
	site: SiteDetails;
	disabled: boolean;
	refundAmount: string;
	downgradePlanPrice: number | null;
	cancelBundledDomain: boolean;
	includedDomainPurchase: object;
	freeMonthOfferClick?: () => void;
	downgradeClick?: ( upsell: string ) => void;
};

export default function UpsellStep( { upsell, purchase, site, disabled, ...props }: StepProps ) {
	const translate = useTranslate();

	if ( ! upsell ) {
		return null;
	}

	if ( upsell === 'business-atomic' ) {
		return (
			<Upsell
				// onClick={ this.closeDialog }
				buttonText={ translate( 'Keep my plan' ) }
				image={ pluginsThemesImage }
				disabled={ disabled }
			>
				<BusinessATStep />
			</Upsell>
		);
	}

	if ( upsell === 'upgrade-atomic' ) {
		return (
			<Upsell
				href={ `/checkout/${ site.slug }/business?coupon=BIZC25` }
				onClick={ () => recordTracksEvent( 'calypso_cancellation_upgrade_at_step_upgrade_click' ) }
				buttonText={ translate( 'Upgrade my site' ) }
				image={ pluginsThemesImage }
				disabled={ disabled }
			>
				<UpgradeATStep selectedSite={ site } />
			</Upsell>
		);
	}

	if ( upsell === 'free-month-offer' ) {
		return (
			<Upsell
				onClick={ props.freeMonthOfferClick }
				buttonText={ translate( 'Get a free month' ) }
				image={ rocketImage }
				disabled={ disabled }
			>
				<FreeMonthOfferStep productSlug={ purchase.productSlug } />
			</Upsell>
		);
	}

	if ( upsell === 'downgrade-personal' || upsell === 'downgrade-monthly' ) {
		const { precision } = getCurrencyDefaults( purchase.currencyCode );
		const planCost = ( props.downgradePlanPrice || 0 ).toFixed( precision );
		const buttonText =
			upsell === 'downgrade-monthly'
				? translate( 'Switch to a monthly subscription' )
				: translate( 'Switch to Personal' );

		return (
			<Upsell
				onClick={ () => props.downgradeClick?.( upsell ) }
				buttonText={ buttonText }
				image={ downgradeImage }
				disabled={ disabled }
			>
				<DowngradeStep
					currencySymbol={ purchase.currencySymbol }
					planCost={ planCost }
					refundAmount={ props.refundAmount }
					upsell={ upsell }
					cancelBundledDomain={ props.cancelBundledDomain }
					includedDomainPurchase={ props.includedDomainPurchase }
				/>
			</Upsell>
		);
	}

	return null;
}
