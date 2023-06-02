import { useTranslate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import { preventWidows } from 'calypso/lib/formatting';

type CommissionFeesProps = {
	className?: string;
	commission: number | null;
	iconSize?: number;
};

const CommissionFees = ( { className, commission, iconSize = 16 }: CommissionFeesProps ) => {
	const translate = useTranslate();

	if ( commission === null ) {
		return null;
	}

	const commissionFee = commission * 100;
	const StripeFeesLink = (
		<ExternalLink href="https://stripe.com/pricing" icon={ true } iconSize={ iconSize } />
	);
	const plansLink = '/plans';
	let commissionFeesText;

	if ( commission === 0 ) {
		commissionFeesText = translate(
			'With your current plan, the transaction fee for payments is %(commissionFee)d% (+ <StripeFeesLink>Stripe fees</StripeFeesLink>).',
			{
				args: {
					commissionFee,
				},
				components: {
					StripeFeesLink,
				},
			}
		);
	} else {
		commissionFeesText = translate(
			'With your current plan, the transaction fee for payments is %(commissionFee)d% (+ <StripeFeesLink>Stripe fees</StripeFeesLink>). <UpgradeLink>Upgrade to lower it.</UpgradeLink>',
			{
				args: {
					commissionFee,
				},
				components: {
					StripeFeesLink,
					UpgradeLink: <a href={ plansLink } />,
				},
			}
		);
	}

	return <span className={ className }>{ preventWidows( commissionFeesText ) }</span>;
};

export default CommissionFees;
