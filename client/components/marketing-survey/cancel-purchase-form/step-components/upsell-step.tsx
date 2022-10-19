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
	children: React.ReactChild;
	image: string;
};

function Upsell( { children, image }: UpsellProps ) {
	return (
		<div className="cancel-purchase-form__upsell">
			<img className="cancel-purchase-form__upsell-image" src={ image } alt="" />
			<div className="cancel-purchase-form__upsell-description">{ children }</div>
		</div>
	);
}

type StepProps = {
	upsell: string;
	site: SiteDetails;
	purchase: Purchase;
	refundAmount: string;
	downgradePlanPrice: number | null;
	cancelBundledDomain: boolean;
	includedDomainPurchase: object;
};

export default function UpsellStep( { upsell, site, purchase, ...props }: StepProps ) {
	if ( upsell === 'business-atomic' ) {
		return (
			<Upsell image={ pluginsThemesImage }>
				<BusinessATStep />
			</Upsell>
		);
	}

	if ( upsell === 'upgrade-atomic' ) {
		return (
			<Upsell image={ pluginsThemesImage }>
				<UpgradeATStep selectedSite={ site } />
			</Upsell>
		);
	}

	if ( upsell === 'free-month-offer' ) {
		return (
			<Upsell image={ rocketImage }>
				<FreeMonthOfferStep productSlug={ purchase.productSlug } />
			</Upsell>
		);
	}

	if ( upsell === 'downgrade-personal' || upsell === 'downgrade-monthly' ) {
		const { precision } = getCurrencyDefaults( purchase.currencyCode );
		const planCost = ( props.downgradePlanPrice || 0 ).toFixed( precision );

		return (
			<Upsell image={ downgradeImage }>
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

type ButtonProps = {
	upsell: string;
	label: string;
	disabled: boolean;
	isBusy: boolean;
	siteSlug: string;
	closeDialog: () => void;
	freeMonthOfferClick?: () => void;
	downgradeClick?: ( upsell: string ) => void;
};

export function UpsellStepButton( { disabled, upsell, siteSlug, ...props }: ButtonProps ) {
	const translate = useTranslate();
	const buttonProps = {
		disabled,
		isPrimary: true,
		isDefault: true,
		isBusy: props.isBusy || false,
	};

	if ( upsell === 'business-atomic' ) {
		return (
			<Button { ...buttonProps } onClick={ props.closeDialog }>
				{ translate( 'Keep my plan' ) }
			</Button>
		);
	}

	if ( upsell === 'upgrade-atomic' ) {
		return (
			<Button
				{ ...buttonProps }
				href={ `/checkout/${ siteSlug }/business?coupon=BIZC25` }
				onClick={ () => recordTracksEvent( 'calypso_cancellation_upgrade_at_step_upgrade_click' ) }
			>
				{ translate( 'Upgrade my site' ) }
			</Button>
		);
	}

	if ( upsell === 'free-month-offer' && props.freeMonthOfferClick ) {
		return (
			<Button { ...buttonProps } onClick={ props.freeMonthOfferClick }>
				{ translate( 'Get a free month' ) }
			</Button>
		);
	}

	if ( [ 'downgrade-monthly', 'downgrade-personal' ].includes( upsell ) && props.downgradeClick ) {
		const buttonText =
			upsell === 'downgrade-monthly'
				? translate( 'Switch to a monthly subscription' )
				: translate( 'Switch to Personal' );

		return (
			<Button { ...buttonProps } onClick={ () => props.downgradeClick?.( upsell ) }>
				{ buttonText }
			</Button>
		);
	}

	return null;
}

UpsellStep.Button = UpsellStepButton;
